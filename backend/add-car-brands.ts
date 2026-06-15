import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Hàm tạo slug từ tiếng Việt/tên thương hiệu
function toSlug(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function main() {
    const args = process.argv.slice(2);

    console.log('====================================================');
    console.log('🚗 BẮT ĐẦU CẬP NHẬT HÃNG XE (VEHICLE BRAND)...');
    console.log('====================================================');

    if (args.length >= 2) {
        // Mode 1: Thêm hãng xe tùy chỉnh qua đối số truyền vào
        const brandName = args[0];
        const country = args[1];
        const logoUrl = args[2] || `/brands/${toSlug(brandName)}.png`;
        const slug = toSlug(brandName);

        const existing = await prisma.vehicleBrand.findUnique({
            where: { slug }
        });

        if (existing) {
            const updated = await prisma.vehicleBrand.update({
                where: { id: existing.id },
                data: { name: brandName, country, logoUrl }
            });
            console.log(`✏️ Đã cập nhật hãng xe sẵn có: ${updated.name} (${updated.country})`);
        } else {
            const created = await prisma.vehicleBrand.create({
                data: { name: brandName, slug, country, logoUrl }
            });
            console.log(`✅ Đã thêm hãng xe mới: ${created.name} (${created.country})`);
        }
    } else {
        // Mode 2: Seed danh sách hãng xe chuẩn phổ biến tại Việt Nam
        const standardBrands = [
            { name: 'Honda', country: 'Nhật Bản' },
            { name: 'Kia', country: 'Hàn Quốc' },
            { name: 'Mitsubishi', country: 'Nhật Bản' },
            { name: 'Suzuki', country: 'Nhật Bản' },
            { name: 'Nissan', country: 'Nhật Bản' },
            { name: 'Audi', country: 'Đức' },
            { name: 'Lexus', country: 'Nhật Bản' },
            { name: 'Porsche', country: 'Đức' },
            { name: 'Volvo', country: 'Thụy Điển' },
            { name: 'Peugeot', country: 'Pháp' }
        ];

        let createdCount = 0;
        let updatedCount = 0;

        for (const brand of standardBrands) {
            const slug = toSlug(brand.name);
            const logoUrl = `/brands/${slug}.png`;

            const existing = await prisma.vehicleBrand.findUnique({
                where: { slug }
            });

            if (existing) {
                await prisma.vehicleBrand.update({
                    where: { id: existing.id },
                    data: { ...brand, logoUrl }
                });
                updatedCount++;
            } else {
                await prisma.vehicleBrand.create({
                    data: { ...brand, slug, logoUrl }
                });
                createdCount++;
            }
        }
        console.log(`✅ Hoàn tất seed danh sách chuẩn: Đã thêm mới ${createdCount} hãng, Cập nhật ${updatedCount} hãng.`);
    }

    // Xóa Redis Cache
    console.log('🔄 Đang xóa toàn bộ Redis Cache để đồng bộ dữ liệu ngay lên website...');
    try {
        const redis = new Redis(redisUrl);
        const keys = await redis.keys('vehicles:*');
        if (keys.length > 0) {
            await redis.del(...keys);
            console.log(`✅ Đã xóa ${keys.length} key trong cache Redis.`);
        } else {
            console.log('ℹ️ Không có key cache nào cần xóa.');
        }
        redis.disconnect();
    } catch (err) {
        console.warn('⚠️ Cảnh báo: Không thể kết nối Redis để xóa cache:', (err as any).message);
    }

    console.log('====================================================');
    console.log('📊 THIẾT LẬP HÃNG XE HOÀN TẤT THÀNH CÔNG!');
    console.log('====================================================');
}

main()
    .catch((e) => {
        console.error('❌ Lỗi:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

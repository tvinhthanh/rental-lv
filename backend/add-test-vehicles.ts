import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

async function main() {
    const args = process.argv.slice(2);
    const mode = args[0]?.toLowerCase(); // 'maintenance', 'unavailable', or undefined

    console.log('====================================================');
    console.log('🚗 THÊM XE THỬ NGHIỆM TRẠNG THÁI ĐANG BẢO DƯỠNG / KHÔNG KHẢ DỤNG...');
    console.log('====================================================');

    // Lấy chi nhánh, danh mục, hãng xe, bảng giá đầu tiên có sẵn để gán cho xe test
    const branch = await prisma.branch.findFirst({ where: { isActive: true } });
    const category = await prisma.vehicleCategory.findFirst({ where: { isActive: true } });
    const brand = await prisma.vehicleBrand.findFirst();
    const priceList = await prisma.priceList.findFirst({ where: { isActive: true } });

    if (!branch || !category || !brand || !priceList) {
        console.error('❌ Lỗi: Vui lòng chạy "npx ts-node check-and-seed.ts" trước để tạo chi nhánh, danh mục, hãng xe, bảng giá chuẩn.');
        process.exit(1);
    }

    const newVehicles: any[] = [];

    // Tạo xe đang bảo dưỡng (MAINTENANCE)
    if (!mode || mode === 'maintenance') {
        const randNum = Math.floor(100 + Math.random() * 900);
        newVehicles.push({
            name: `Mazda CX-3 Premium (Test ${randNum})`,
            vehicleType: 'SUV',
            licensePlate: `30H-${randNum}.${Math.floor(10 + Math.random() * 90)}`,
            model: 'CX-3',
            year: 2022,
            color: 'Đỏ',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 12000,
            status: 'MAINTENANCE',
            slug: `mazda-cx3-premium-test-${randNum}`,
            photos: ['/cars/luxa.webp'],
            categoryId: category.id,
            brandId: brand.id,
            priceListId: priceList.id,
            branchId: branch.id
        });
    }

    // Tạo xe không khả dụng (UNAVAILABLE)
    if (!mode || mode === 'unavailable') {
        const randNum = Math.floor(100 + Math.random() * 900);
        newVehicles.push({
            name: `Toyota Altis 1.8G (Test ${randNum})`,
            vehicleType: 'Sedan',
            licensePlate: `51K-${randNum}.${Math.floor(10 + Math.random() * 90)}`,
            model: 'Altis',
            year: 2023,
            color: 'Trắng',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 5500,
            status: 'UNAVAILABLE',
            slug: `toyota-altis-18g-test-${randNum}`,
            photos: ['/cars/camry.webp'],
            categoryId: category.id,
            brandId: brand.id,
            priceListId: priceList.id,
            branchId: branch.id
        });
    }

    // Thêm xe vào database
    for (const v of newVehicles) {
        const vehicle = await prisma.vehicle.create({ data: v });
        console.log(`✅ Đã tạo xe: ${vehicle.name} (${vehicle.licensePlate}) - Trạng thái: ${vehicle.status}`);

        // Tự động sinh giấy tờ hợp lệ
        const requiredDocTypes = ['REGISTRATION', 'INSURANCE'];
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 2);

        for (const docType of requiredDocTypes) {
            await prisma.vehicleDocument.create({
                data: {
                    vehicleId: vehicle.id,
                    docType: docType,
                    documentName: docType === 'REGISTRATION' ? 'Giấy đăng kiểm xe cơ giới' : 'Bảo hiểm bắt buộc trách nhiệm dân sự',
                    number: 'REG-' + Math.floor(100000 + Math.random() * 900000),
                    issuedAt: new Date(),
                    expiresAt: futureDate,
                    notes: 'Tự động tạo cho xe test.'
                }
            });
        }
        console.log(`   └─> Đã tạo giấy tờ REGISTRATION & INSURANCE hợp lệ.`);
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
    console.log('📊 THÊM XE THỬ NGHIỆM HOÀN TẤT THÀNH CÔNG!');
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

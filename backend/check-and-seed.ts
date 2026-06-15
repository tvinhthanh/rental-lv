import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('====================================================');
    console.log('🔄 BẮT ĐẦU THIẾT LẬP DỮ LIỆU CHUẨN (PRODUCTION-READY SEED)...');
    console.log('====================================================');

    // 1. Tạo các chi nhánh chuẩn (Branches)
    const branchesData = [
        {
            name: 'Chi nhánh Quận 1 - TP. HCM',
            code: 'CN-Q1',
            slug: 'chi-nhanh-quan-1',
            address: '123 Nguyễn Huệ, Bến Nghé, Quận 1',
            city: 'Hồ Chí Minh',
            country: 'Việt Nam',
            phone: '0901234567',
            email: 'quan1@rental.com',
            isActive: true
        },
        {
            name: 'Chi nhánh Cầu Giấy - Hà Nội',
            code: 'CN-HN',
            slug: 'chi-nhanh-cau-giay',
            address: '26 Đường Láng, Cầu Giấy',
            city: 'Hà Nội',
            country: 'Việt Nam',
            phone: '0912345678',
            email: 'hanoi@rental.com',
            isActive: true
        },
        {
            name: 'Chi nhánh Hải Châu - Đà Nẵng',
            code: 'CN-DN',
            slug: 'chi-nhanh-hai-chau',
            address: '50 Bạch Đằng, Hải Châu',
            city: 'Đà Nẵng',
            country: 'Việt Nam',
            phone: '0923456789',
            email: 'danang@rental.com',
            isActive: true
        }
    ];

    const branches: any[] = [];
    for (const b of branchesData) {
        let branchObj = await prisma.branch.findFirst({
            where: {
                OR: [
                    { code: b.code },
                    { slug: b.slug }
                ]
            }
        });

        if (branchObj) {
            branchObj = await prisma.branch.update({
                where: { id: branchObj.id },
                data: b
            });
        } else {
            branchObj = await prisma.branch.create({ data: b });
        }
        branches.push(branchObj);
        console.log(`✅ Chi nhánh: ${branchObj.name}`);
    }

    // 1.1. Chuẩn hóa tên các chi nhánh thử nghiệm cũ thành tên chi nhánh chuyên nghiệp
    console.log('🔄 Đang kiểm tra và chuẩn hóa tên các chi nhánh thử nghiệm cũ...');
    const branchRenames = [
        { old: 'Quan 6', new: 'Chi nhánh Quận 6 - TP. HCM', code: 'CN-Q6', slug: 'chi-nhanh-quan-6', city: 'Hồ Chí Minh' },
        { old: 'Quan 5', new: 'Chi nhánh Quận 5 - TP. HCM', code: 'CN-Q5', slug: 'chi-nhanh-quan-5', city: 'Hồ Chí Minh' },
        { old: 'Q7', new: 'Chi nhánh Quận 7 - TP. HCM', code: 'CN-Q7', slug: 'chi-nhanh-quan-7', city: 'Hồ Chí Minh' },
        { old: 'Q8', new: 'Chi nhánh Quận 8 - TP. HCM', code: 'CN-Q8', slug: 'chi-nhanh-quan-8', city: 'Hồ Chí Minh' },
        { old: 'Xuân Trí Trần', new: 'Chi nhánh Bình Thạnh - TP. HCM', code: 'CN-BT', slug: 'chi-nhanh-binh-thanh', city: 'Hồ Chí Minh' },
        { old: 'toyota quận 1', new: 'Chi nhánh Đống Đa - Hà Nội', code: 'CN-DD', slug: 'chi-nhanh-dong-da', city: 'Hà Nội' },
        { old: 'toyota quận 2', new: 'Chi nhánh Tây Hồ - Hà Nội', code: 'CN-TH', slug: 'chi-nhanh-tay-ho', city: 'Hà Nội' }
    ];

    for (const rename of branchRenames) {
        const existing = await prisma.branch.findFirst({
            where: {
                name: {
                    equals: rename.old,
                    mode: 'insensitive'
                }
            }
        });

        if (existing) {
            await prisma.branch.update({
                where: { id: existing.id },
                data: {
                    name: rename.new,
                    code: rename.code,
                    slug: rename.slug,
                    city: rename.city,
                    isActive: true
                }
            });
            console.log(`✏️ Đã chuẩn hóa chi nhánh: "${rename.old}" -> "${rename.new}"`);
        }
    }

    // 2. Tạo danh mục xe chuẩn (VehicleCategory)
    const categoriesData = [
        {
            name: 'Xe 4 Chỗ (Sedan)',
            code: 'SEDAN',
            slug: 'sedan',
            description: 'Dòng xe sedan 4 chỗ nhỏ gọn, thích hợp di chuyển đô thị, sang trọng và tiết kiệm nhiên liệu.',
            isActive: true
        },
        {
            name: 'Xe 7 Chỗ (SUV)',
            code: 'SUV',
            slug: 'suv',
            description: 'Xe thể thao đa dụng 5-7 chỗ, gầm cao, phù hợp cho mọi địa hình và các chuyến đi gia đình dã ngoại.',
            isActive: true
        },
        {
            name: 'Xe Sang (Luxury)',
            code: 'LUXURY',
            slug: 'luxury',
            description: 'Dòng xe cao cấp, sang trọng vượt trội, khẳng định vị thế và đẳng cấp.',
            isActive: true
        },
        {
            name: 'Xe Bán Tải (Pickup)',
            code: 'PICKUP',
            slug: 'pickup',
            description: 'Xe bán tải mạnh mẽ, gầm cao, khoang chứa đồ rộng rãi cho các chuyến chở hàng hoặc dã ngoại.',
            isActive: true
        }
    ];

    const categories: Record<string, any> = {};
    for (const c of categoriesData) {
        let catObj = await prisma.vehicleCategory.findFirst({
            where: {
                OR: [
                    { code: c.code },
                    { slug: c.slug }
                ]
            }
        });

        if (catObj) {
            catObj = await prisma.vehicleCategory.update({
                where: { id: catObj.id },
                data: c
            });
        } else {
            catObj = await prisma.vehicleCategory.create({ data: c });
        }
        categories[c.code] = catObj;
        console.log(`✅ Danh mục: ${catObj.name}`);
    }

    // 3. Tạo thương hiệu xe chuẩn (VehicleBrand)
    const brandsData = [
        { name: 'Toyota', slug: 'toyota', country: 'Nhật Bản', logoUrl: '/brands/toyota.png' },
        { name: 'Mazda', slug: 'mazda', country: 'Nhật Bản', logoUrl: '/brands/mazda.png' },
        { name: 'Hyundai', slug: 'hyundai', country: 'Hàn Quốc', logoUrl: '/brands/hyundai.png' },
        { name: 'VinFast', slug: 'vinfast', country: 'Việt Nam', logoUrl: '/brands/vinfast.png' },
        { name: 'Mercedes-Benz', slug: 'mercedes-benz', country: 'Đức', logoUrl: '/brands/mercedes.png' },
        { name: 'Ford', slug: 'ford', country: 'Mỹ', logoUrl: '/brands/ford.png' },
        { name: 'BMW', slug: 'bmw', country: 'Đức', logoUrl: '/brands/bmw.png' }
    ];

    const brands: Record<string, any> = {};
    for (const b of brandsData) {
        let brandObj = await prisma.vehicleBrand.findUnique({
            where: { slug: b.slug }
        });

        if (brandObj) {
            brandObj = await prisma.vehicleBrand.update({
                where: { id: brandObj.id },
                data: b
            });
        } else {
            brandObj = await prisma.vehicleBrand.create({ data: b });
        }
        brands[b.slug.toUpperCase()] = brandObj;
        console.log(`✅ Thương hiệu: ${brandObj.name}`);
    }

    // 4. Tạo bảng giá chuẩn (PriceList)
    const priceListsData = [
        {
            name: 'Bảng giá Sedan phổ thông',
            dailyRate: 700000,
            hourlyRate: 70000,
            weekendRate: 900000,
            holidayRate: 1100000,
            isActive: true
        },
        {
            name: 'Bảng giá Sedan cao cấp',
            dailyRate: 1200000,
            hourlyRate: 120000,
            weekendRate: 1500000,
            holidayRate: 1800000,
            isActive: true
        },
        {
            name: 'Bảng giá SUV gia đình',
            dailyRate: 1300000,
            hourlyRate: 130000,
            weekendRate: 1600000,
            holidayRate: 2000000,
            isActive: true
        },
        {
            name: 'Bảng giá Xe Sang',
            dailyRate: 2200000,
            hourlyRate: 220000,
            weekendRate: 2600000,
            holidayRate: 3200000,
            isActive: true
        },
        {
            name: 'Bảng giá Xe Bán Tải',
            dailyRate: 1000000,
            hourlyRate: 100000,
            weekendRate: 1200000,
            holidayRate: 1500000,
            isActive: true
        }
    ];

    const priceLists: Record<string, any> = {};
    for (const pl of priceListsData) {
        let plObj = await prisma.priceList.findFirst({
            where: { name: pl.name }
        });
        if (!plObj) {
            plObj = await prisma.priceList.create({ data: pl });
        } else {
            plObj = await prisma.priceList.update({
                where: { id: plObj.id },
                data: pl
            });
        }
        priceLists[pl.name] = plObj;
        console.log(`✅ Bảng giá: ${plObj.name}`);
    }

    // 5. Tạo xe chuẩn kết hợp hình ảnh chất lượng (Vehicles)
    const vehiclesData = [
        {
            name: 'VinFast Lux A2.0 Standard',
            vehicleType: 'Sedan',
            licensePlate: '51K-888.88',
            model: 'Lux A2.0',
            year: 2022,
            color: 'Đen',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 8500,
            status: 'AVAILABLE',
            slug: 'vinfast-lux-a20-standard',
            photos: ['/cars/luxa.webp'],
            categoryId: categories.SEDAN.id,
            brandId: brands.VINFAST.id,
            priceListId: priceLists['Bảng giá Sedan cao cấp'].id,
            branchId: branches[0].id // Quận 1
        },
        {
            name: 'Toyota Camry 2.5Q',
            vehicleType: 'Sedan',
            licensePlate: '51K-666.66',
            model: 'Camry 2.5Q',
            year: 2023,
            color: 'Trắng',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 4200,
            status: 'AVAILABLE',
            slug: 'toyota-camry-25q',
            photos: ['/cars/camry.webp'],
            categoryId: categories.SEDAN.id,
            brandId: brands.TOYOTA.id,
            priceListId: priceLists['Bảng giá Sedan cao cấp'].id,
            branchId: branches[0].id // Quận 1
        },
        {
            name: 'Mercedes-Benz C300 AMG',
            vehicleType: 'Luxury',
            licensePlate: '51K-999.99',
            model: 'C300 AMG',
            year: 2023,
            color: 'Đỏ',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 3000,
            status: 'AVAILABLE',
            slug: 'mercedes-benz-c300-amg',
            photos: ['/cars/c300.webp'],
            categoryId: categories.LUXURY.id,
            brandId: brands['MERCEDES-BENZ'].id,
            priceListId: priceLists['Bảng giá Xe Sang'].id,
            branchId: branches[0].id // Quận 1
        },
        {
            name: 'Toyota Vios 1.5G CVT',
            vehicleType: 'Sedan',
            licensePlate: '30H-123.45',
            model: 'Vios 1.5G',
            year: 2022,
            color: 'Bạc',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 12000,
            status: 'AVAILABLE',
            slug: 'toyota-vios-15g-cvt',
            photos: ['/cars/camry.webp'], // dùng tạm hình camry
            categoryId: categories.SEDAN.id,
            brandId: brands.TOYOTA.id,
            priceListId: priceLists['Bảng giá Sedan phổ thông'].id,
            branchId: branches[1].id // Hà Nội
        },
        {
            name: 'Ford Ranger Wildtrak 2.0L Bi-Turbo',
            vehicleType: 'Pickup',
            licensePlate: '43C-567.89',
            model: 'Ranger Wildtrak',
            year: 2023,
            color: 'Cam',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Dầu (Diesel)',
            mileage: 6800,
            status: 'AVAILABLE',
            slug: 'ford-ranger-wildtrak-20l',
            photos: ['/cars/luxa.webp'], // dùng tạm hình luxa
            categoryId: categories.PICKUP.id,
            brandId: brands.FORD.id,
            priceListId: priceLists['Bảng giá Xe Bán Tải'].id,
            branchId: branches[2].id // Đà Nẵng
        },
        {
            name: 'Mazda CX-5 Premium',
            vehicleType: 'SUV',
            licensePlate: '30H-999.88',
            model: 'CX-5',
            year: 2022,
            color: 'Đỏ',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 15000,
            status: 'MAINTENANCE',
            slug: 'mazda-cx5-premium',
            photos: ['/cars/luxa.webp'],
            categoryId: categories.SUV.id,
            brandId: brands.MAZDA.id,
            priceListId: priceLists['Bảng giá SUV gia đình'].id,
            branchId: branches[1].id // Hà Nội
        },
        {
            name: 'Hyundai SantaFe Premium',
            vehicleType: 'SUV',
            licensePlate: '43A-777.77',
            model: 'SantaFe',
            year: 2023,
            color: 'Trắng',
            seatCount: 7,
            transmission: 'Tự động',
            fuelType: 'Dầu (Diesel)',
            mileage: 9800,
            status: 'UNAVAILABLE',
            slug: 'hyundai-santafe-premium',
            photos: ['/cars/camry.webp'],
            categoryId: categories.SUV.id,
            brandId: brands.HYUNDAI.id,
            priceListId: priceLists['Bảng giá SUV gia đình'].id,
            branchId: branches[2].id // Đà Nẵng
        },
        {
            name: 'BMW 320i Sport Line',
            vehicleType: 'Luxury',
            licensePlate: '51K-777.88',
            model: '320i',
            year: 2022,
            color: 'Xanh',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Xăng',
            mileage: 18000,
            status: 'MAINTENANCE',
            slug: 'bmw-320i-sport-line',
            photos: ['/cars/c300.webp'],
            categoryId: categories.LUXURY.id,
            brandId: brands.BMW.id,
            priceListId: priceLists['Bảng giá Xe Sang'].id,
            branchId: branches[0].id // Quận 1
        },
        {
            name: 'Toyota Vios 1.5E MT',
            vehicleType: 'Sedan',
            licensePlate: '30K-444.55',
            model: 'Vios 1.5E',
            year: 2021,
            color: 'Bạc',
            seatCount: 5,
            transmission: 'Số sàn',
            fuelType: 'Xăng',
            mileage: 45000,
            status: 'MAINTENANCE',
            slug: 'toyota-vios-15e-mt',
            photos: ['/cars/camry.webp'],
            categoryId: categories.SEDAN.id,
            brandId: brands.TOYOTA.id,
            priceListId: priceLists['Bảng giá Sedan phổ thông'].id,
            branchId: branches[1].id // Hà Nội
        },
        {
            name: 'VinFast VF8 Plus',
            vehicleType: 'SUV',
            licensePlate: '30K-888.99',
            model: 'VF8',
            year: 2023,
            color: 'Xanh',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Điện',
            mileage: 5000,
            status: 'UNAVAILABLE',
            slug: 'vinfast-vf8-plus',
            photos: ['/cars/luxa.webp'],
            categoryId: categories.SUV.id,
            brandId: brands.VINFAST.id,
            priceListId: priceLists['Bảng giá SUV gia đình'].id,
            branchId: branches[1].id // Hà Nội
        },
        {
            name: 'Ford Ranger XLS 2.0L',
            vehicleType: 'Pickup',
            licensePlate: '43C-333.44',
            model: 'Ranger XLS',
            year: 2022,
            color: 'Xám',
            seatCount: 5,
            transmission: 'Tự động',
            fuelType: 'Dầu (Diesel)',
            mileage: 25000,
            status: 'UNAVAILABLE',
            slug: 'ford-ranger-xls-20l',
            photos: ['/cars/luxa.webp'],
            categoryId: categories.PICKUP.id,
            brandId: brands.FORD.id,
            priceListId: priceLists['Bảng giá Xe Bán Tải'].id,
            branchId: branches[2].id // Đà Nẵng
        }
    ];

    for (const v of vehiclesData) {
        let vehicleObj = await prisma.vehicle.findFirst({
            where: {
                OR: [
                    { licensePlate: v.licensePlate },
                    { slug: v.slug }
                ]
            }
        });

        if (vehicleObj) {
            vehicleObj = await prisma.vehicle.update({
                where: { id: vehicleObj.id },
                data: v
            });
        } else {
            vehicleObj = await prisma.vehicle.create({ data: v });
        }
        console.log(`✅ Xe: ${vehicleObj.name} (${vehicleObj.licensePlate})`);
    }

    // 6. Tự động kiểm tra và thêm giấy tờ cho TẤT CẢ các xe hiện tại để đủ điều kiện hiển thị ở Homepage
    console.log('🔄 Đang kiểm tra và tạo giấy tờ bắt buộc (REGISTRATION & INSURANCE) cho các xe...');
    const allVehicles = await prisma.vehicle.findMany();
    let docCreatedCount = 0;

    for (const vehicle of allVehicles) {
        const requiredDocTypes = ['REGISTRATION', 'INSURANCE'];
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 2); // Hạn sử dụng: 2 năm sau

        for (const docType of requiredDocTypes) {
            const existingDoc = await prisma.vehicleDocument.findFirst({
                where: {
                    vehicleId: vehicle.id,
                    docType: docType
                }
            });

            if (!existingDoc) {
                await prisma.vehicleDocument.create({
                    data: {
                        vehicleId: vehicle.id,
                        docType: docType,
                        documentName: docType === 'REGISTRATION' ? 'Giấy đăng kiểm xe cơ giới' : 'Bảo hiểm bắt buộc trách nhiệm dân sự',
                        number: 'REG-' + Math.floor(100000 + Math.random() * 900000),
                        issuedAt: new Date(),
                        expiresAt: futureDate,
                        notes: 'Tự động tạo bởi hệ thống để xe đủ điều kiện hiển thị trên homepage.'
                    }
                });
                docCreatedCount++;
            }
        }
    }
    console.log(`✅ Đã tạo bổ sung ${docCreatedCount} bộ giấy tờ hợp lệ cho các xe.`);

    // 7. Thêm tài khoản admin phụ và nhân viên chi nhánh
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const userAdmin = await prisma.user.upsert({
        where: { email: 'admin@rental.com' },
        update: {
            name: 'Hệ thống Admin',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
        },
        create: {
            email: 'admin@rental.com',
            name: 'Hệ thống Admin',
            password: hashedPassword,
            role: 'ADMIN',
            isActive: true
        }
    });
    console.log(`✅ Tài khoản hệ thống Admin: admin@rental.com / admin123`);

    // Tạo nhân viên chi nhánh Quận 1
    const userEmployee = await prisma.user.upsert({
        where: { email: 'employee1@rental.com' },
        update: {
            name: 'Nguyễn Văn Nhân Viên',
            password: hashedPassword,
            role: 'EMPLOYEE',
            isActive: true
        },
        create: {
            email: 'employee1@rental.com',
            name: 'Nguyễn Văn Nhân Viên',
            password: hashedPassword,
            role: 'EMPLOYEE',
            isActive: true
        }
    });

    await prisma.employee.upsert({
        where: { userId: userEmployee.id },
        update: {
            fullName: 'Nguyễn Văn Nhân Viên',
            phone: '0988888888',
            email: 'employee1@rental.com',
            branchId: branches[0].id,
            status: 'ACTIVE'
        },
        create: {
            userId: userEmployee.id,
            fullName: 'Nguyễn Văn Nhân Viên',
            phone: '0988888888',
            email: 'employee1@rental.com',
            branchId: branches[0].id,
            status: 'ACTIVE'
        }
    });
    console.log(`✅ Tài khoản Nhân viên Quận 1: employee1@rental.com / admin123`);

    console.log('====================================================');
    console.log('📊 THIẾT LẬP DỮ LIỆU HOÀN TẤT THÀNH CÔNG!');
    console.log('====================================================');
}

main()
    .catch((e) => {
        console.error('❌ LỖI TRONG QUÁ TRÌNH SEED DỮ LIỆU:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

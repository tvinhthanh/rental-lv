import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { checkVehicleDocumentsComplete } from '@/common/utils/vehicle-document-checker';

@Injectable()
export class VehicleService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    // ----------------------------------------------------------
    // LIST
    // ----------------------------------------------------------
    async findAll(query: VehicleQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { licensePlate: { contains: query.search, mode: 'insensitive' } },
                { model: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.status) where.status = query.status;
        if (query.branchId) where.branchId = query.branchId;
        if (query.categoryId) where.categoryId = query.categoryId;

        const [allVehicles, total] = await this.prisma.$transaction([
            this.prisma.vehicle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    branch: true,
                    priceList: true,
                    brand: true
                }
            }),
            this.prisma.vehicle.count({ where })
        ]);

        // Nếu skipDocumentCheck=true (admin), không filter giấy tờ
        const skipDocumentCheck = query.skipDocumentCheck === 'true';
        console.log(`[VehicleService] findAll - skipDocumentCheck: ${skipDocumentCheck}, query.skipDocumentCheck: ${query.skipDocumentCheck}, total vehicles: ${allVehicles.length}`);
        
        if (skipDocumentCheck) {
            // Admin: trả về tất cả xe không filter
            console.log(`[VehicleService] Admin mode - returning all ${allVehicles.length} vehicles without document filter`);
            return {
                items: allVehicles,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            };
        }

        // User: Filter ra những xe có đủ giấy tờ (chỉ hiển thị xe đủ giấy tờ cho user)
        const itemsWithDocuments = [];
        for (const vehicle of allVehicles) {
            const { isValid, missingDocs } = await checkVehicleDocumentsComplete(this.prisma, vehicle.id);
            if (isValid) {
                itemsWithDocuments.push(vehicle);
            } else {
                console.log(`[VehicleService] Vehicle ${vehicle.id} (${vehicle.name}) filtered out - missing docs:`, missingDocs);
            }
        }
        
        console.log(`[VehicleService] findAll: ${itemsWithDocuments.length}/${allVehicles.length} vehicles passed document check`);

        return {
            items: itemsWithDocuments,
            total: itemsWithDocuments.length, // Total sau khi filter
            page,
            limit,
            totalPages: Math.ceil(itemsWithDocuments.length / limit)
        };
    }

    // ----------------------------------------------------------
    // DETAIL
    // ----------------------------------------------------------
    async findOne(id: string) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                category: true,
                branch: true,
                brand: true,
                priceList: true,
                maintenances: true,
                bookings: true,
                reviews: true
            }
        });

        if (!vehicle)
            throw new NotFoundException('Vehicle not found');

        return vehicle;
    }

    async findBySlug(slug: string) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { slug },
            include: {
                brand: true,
                branch: true,
                category: true,
                priceList: true
            }
        });

        if (!vehicle) throw new NotFoundException('Vehicle not found');
        return vehicle;
    }

    // ----------------------------------------------------------
    // CREATE
    // ----------------------------------------------------------
    async create(dto: CreateVehicleDto, actorId?: string) {
        let priceListId = dto.priceListId || null;
        let override = dto.overridePriceEnabled ?? false;

        if (override) {
            priceListId = null;
        } else {
            if (!priceListId || priceListId.trim() === "") {
                priceListId = null;
            }
            dto.overrideDailyRate = 0;
            dto.overrideHourlyRate = 0;
            dto.overrideWeekendRate = 0;
            dto.overrideHolidayRate = 0;
        }

        const vehicle = await this.prisma.vehicle.create({
            data: {
                name: dto.name,
                licensePlate: dto.licensePlate,
                vehicleType: dto.vehicleType,
                model: dto.model,
                year: dto.year,
                color: dto.color,
                seatCount: dto.seatCount,
                transmission: dto.transmission,
                fuelType: dto.fuelType,
                mileage: dto.mileage,
                status: dto.status ?? "AVAILABLE",

                slug: dto.slug,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
                seoDescription: dto.seoDescription,

                photos: dto.photos ?? [],

                categoryId: dto.categoryId,
                branchId: dto.branchId,
                brandId: dto.brandId,

                priceListId,

                overridePriceEnabled: override,
                overrideDailyRate: dto.overrideDailyRate,
                overrideHourlyRate: dto.overrideHourlyRate,
                overrideWeekendRate: dto.overrideWeekendRate,
                overrideHolidayRate: dto.overrideHolidayRate
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Vehicle', vehicle.id, {
            name: vehicle.name,
            licensePlate: vehicle.licensePlate
        });

        return vehicle;
    }

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------
    async update(id: string, dto: UpdateVehicleDto, actorId?: string) {
        const current = await this.findOne(id);

        const updateData: any = {};

        // Basic fields
        Object.assign(updateData, {
            ...(dto.name !== undefined && { name: dto.name }),
            ...(dto.vehicleType !== undefined && { vehicleType: dto.vehicleType }),
            ...(dto.licensePlate !== undefined && { licensePlate: dto.licensePlate }),
            ...(dto.model !== undefined && { model: dto.model }),
            ...(dto.year !== undefined && { year: dto.year }),
            ...(dto.color !== undefined && { color: dto.color }),
            ...(dto.seatCount !== undefined && { seatCount: dto.seatCount }),
            ...(dto.transmission !== undefined && { transmission: dto.transmission }),
            ...(dto.fuelType !== undefined && { fuelType: dto.fuelType }),
            ...(dto.mileage !== undefined && { mileage: dto.mileage }),
            ...(dto.status !== undefined && { status: dto.status }),

            ...(dto.slug !== undefined && { slug: dto.slug }),
            ...(dto.metaTitle !== undefined && { metaTitle: dto.metaTitle }),
            ...(dto.metaDescription !== undefined && { metaDescription: dto.metaDescription }),
            ...(dto.seoDescription !== undefined && { seoDescription: dto.seoDescription }),

            ...(dto.photos !== undefined && { photos: dto.photos }),

            ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
            ...(dto.branchId !== undefined && { branchId: dto.branchId }),
            ...(dto.brandId !== undefined && { brandId: dto.brandId })
        });

        // ⚡ Logic price source (priceList vs override)
        const hasPriceList = dto.priceListId && dto.priceListId !== "";
        const usingOverride = dto.overridePriceEnabled ?? current.overridePriceEnabled;

        if (usingOverride) {
            updateData.overridePriceEnabled = true;
            updateData.priceListId = null;
        } else {
            updateData.overridePriceEnabled = false;
            updateData.priceListId = hasPriceList ? dto.priceListId : null;

            updateData.overrideDailyRate = null;
            updateData.overrideHourlyRate = null;
            updateData.overrideWeekendRate = null;
            updateData.overrideHolidayRate = null;
        }

        // Override values
        if (usingOverride) {
            updateData.overrideDailyRate = dto.overrideDailyRate ?? null;
            updateData.overrideHourlyRate = dto.overrideHourlyRate ?? null;
            updateData.overrideWeekendRate = dto.overrideWeekendRate ?? null;
            updateData.overrideHolidayRate = dto.overrideHolidayRate ?? null;
        }

        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: updateData
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Vehicle', id, updateData);

        return vehicle;
    }

    // ----------------------------------------------------------
    async updateStatus(id: string, status: string, actorId?: string) {
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: { status }
        });

        await this.audit.log(actorId ?? null, 'STATUS_UPDATE', 'Vehicle', id, { status });

        return vehicle;
    }

    async delete(id: string, actorId?: string) {
        // Kiểm tra xe có đang được thuê không (có booking đang active)
        const activeBooking = await this.prisma.booking.findFirst({
            where: {
                vehicleId: id,
                status: { in: ['PENDING', 'CONFIRMED', 'ONGOING'] }
            },
            select: {
                id: true,
                bookingCode: true,
                status: true,
                pickupDate: true,
                returnDate: true
            }
        });

        if (activeBooking) {
            const statusMap: Record<string, string> = {
                'PENDING': 'Đang chờ xác nhận',
                'CONFIRMED': 'Đã xác nhận',
                'ONGOING': 'Đang được thuê'
            };
            throw new BadRequestException(
                `Không thể xóa xe này vì đang có đơn đặt xe đang hoạt động. ` +
                `Mã đơn: ${activeBooking.bookingCode}, Trạng thái: ${statusMap[activeBooking.status] || activeBooking.status}`
            );
        }

        await this.audit.log(actorId ?? null, 'DELETE', 'Vehicle', id);
        return this.prisma.vehicle.delete({ where: { id } });
    }

    async findByBranch(branchId: string) {
        return this.prisma.vehicle.findMany({
            where: { branchId },
            include: {
                category: true,
                brand: true,
                priceList: true
            }
        });
    }
}

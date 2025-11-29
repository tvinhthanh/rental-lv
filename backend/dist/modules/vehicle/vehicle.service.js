"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let VehicleService = class VehicleService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { licensePlate: { contains: query.search, mode: 'insensitive' } },
                { model: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.status)
            where.status = query.status;
        if (query.branchId)
            where.branchId = query.branchId;
        if (query.categoryId)
            where.categoryId = query.categoryId;
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicle.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    branch: true,
                    priceList: true
                }
            }),
            this.prisma.vehicle.count({ where })
        ]);
        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async findOne(id) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                category: true,
                branch: true,
                priceList: true,
                maintenances: true,
                bookings: true,
                reviews: true
            }
        });
        if (!vehicle)
            throw new common_1.NotFoundException('Vehicle not found');
        return vehicle;
    }
    async create(dto, actorId) {
        var _a, _b, _c;
        let priceListId = dto.priceListId || null;
        let override = (_a = dto.overridePriceEnabled) !== null && _a !== void 0 ? _a : false;
        if (override) {
            priceListId = null;
        }
        else {
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
                status: (_b = dto.status) !== null && _b !== void 0 ? _b : "AVAILABLE",
                slug: dto.slug,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
                seoDescription: dto.seoDescription,
                photos: (_c = dto.photos) !== null && _c !== void 0 ? _c : [],
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
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'CREATE', 'Vehicle', vehicle.id, {
            name: vehicle.name,
            licensePlate: vehicle.licensePlate
        });
        return vehicle;
    }
    async update(id, dto, actorId) {
        var _a, _b, _c, _d, _e;
        const current = await this.findOne(id);
        const updateData = {};
        Object.assign(updateData, Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (dto.name !== undefined && { name: dto.name })), (dto.vehicleType !== undefined && { vehicleType: dto.vehicleType })), (dto.licensePlate !== undefined && { licensePlate: dto.licensePlate })), (dto.model !== undefined && { model: dto.model })), (dto.year !== undefined && { year: dto.year })), (dto.color !== undefined && { color: dto.color })), (dto.seatCount !== undefined && { seatCount: dto.seatCount })), (dto.transmission !== undefined && { transmission: dto.transmission })), (dto.fuelType !== undefined && { fuelType: dto.fuelType })), (dto.mileage !== undefined && { mileage: dto.mileage })), (dto.status !== undefined && { status: dto.status })), (dto.slug !== undefined && { slug: dto.slug })), (dto.metaTitle !== undefined && { metaTitle: dto.metaTitle })), (dto.metaDescription !== undefined && { metaDescription: dto.metaDescription })), (dto.seoDescription !== undefined && { seoDescription: dto.seoDescription })), (dto.photos !== undefined && { photos: dto.photos })), (dto.categoryId !== undefined && { categoryId: dto.categoryId })), (dto.branchId !== undefined && { branchId: dto.branchId })), (dto.brandId !== undefined && { brandId: dto.brandId })));
        const hasPriceList = dto.priceListId && dto.priceListId !== "";
        const usingOverride = (_a = dto.overridePriceEnabled) !== null && _a !== void 0 ? _a : current.overridePriceEnabled;
        if (usingOverride) {
            updateData.overridePriceEnabled = true;
            updateData.priceListId = null;
        }
        else {
            updateData.overridePriceEnabled = false;
            updateData.priceListId = hasPriceList ? dto.priceListId : null;
            updateData.overrideDailyRate = null;
            updateData.overrideHourlyRate = null;
            updateData.overrideWeekendRate = null;
            updateData.overrideHolidayRate = null;
        }
        if (usingOverride) {
            updateData.overrideDailyRate = (_b = dto.overrideDailyRate) !== null && _b !== void 0 ? _b : null;
            updateData.overrideHourlyRate = (_c = dto.overrideHourlyRate) !== null && _c !== void 0 ? _c : null;
            updateData.overrideWeekendRate = (_d = dto.overrideWeekendRate) !== null && _d !== void 0 ? _d : null;
            updateData.overrideHolidayRate = (_e = dto.overrideHolidayRate) !== null && _e !== void 0 ? _e : null;
        }
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: updateData
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'UPDATE', 'Vehicle', id, updateData);
        return vehicle;
    }
    async updateStatus(id, status, actorId) {
        const vehicle = await this.prisma.vehicle.update({
            where: { id },
            data: { status }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'STATUS_UPDATE', 'Vehicle', id, { status });
        return vehicle;
    }
    async delete(id, actorId) {
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'DELETE', 'Vehicle', id);
        return this.prisma.vehicle.delete({ where: { id } });
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map
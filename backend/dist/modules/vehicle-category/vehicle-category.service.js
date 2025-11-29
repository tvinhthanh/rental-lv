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
exports.VehicleCategoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let VehicleCategoryService = class VehicleCategoryService {
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
                { code: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { displayOrder: 'asc' }
            }),
            this.prisma.vehicleCategory.count({ where })
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
        const category = await this.prisma.vehicleCategory.findUnique({
            where: { id },
            include: { vehicles: true }
        });
        if (!category)
            throw new common_1.NotFoundException('Vehicle category not found');
        return category;
    }
    async create(dto, actorId) {
        var _a;
        if (dto.code) {
            const exists = await this.prisma.vehicleCategory.findUnique({ where: { code: dto.code } });
            if (exists)
                throw new common_1.BadRequestException('Category code already exists');
        }
        const category = await this.prisma.vehicleCategory.create({
            data: {
                name: dto.name,
                code: dto.code || null,
                slug: dto.slug || null,
                description: dto.description || null,
                imageUrl: dto.imageUrl || null,
                metaTitle: dto.metaTitle || null,
                metaDescription: dto.metaDescription || null,
                displayOrder: (_a = dto.displayOrder) !== null && _a !== void 0 ? _a : 0
            }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'CREATE', 'VehicleCategory', category.id, category);
        return category;
    }
    async update(id, dto, actorId) {
        const before = await this.findOne(id);
        if (dto.code && dto.code !== before.code) {
            const exists = await this.prisma.vehicleCategory.findUnique({ where: { code: dto.code } });
            if (exists)
                throw new common_1.BadRequestException('Category code already exists');
        }
        const data = {
            name: dto.name,
            code: dto.code,
            slug: dto.slug,
            description: dto.description,
            imageUrl: dto.imageUrl,
            metaTitle: dto.metaTitle,
            metaDescription: dto.metaDescription,
            seoTitle: dto.seoTitle,
            hTitle: dto.hTitle,
            displayOrder: dto.displayOrder,
            isActive: dto.isActive
        };
        const category = await this.prisma.vehicleCategory.update({
            where: { id },
            data
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'UPDATE', 'VehicleCategory', id, {
            before,
            after: category
        });
        return category;
    }
    async delete(id, actorId) {
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'DELETE', 'VehicleCategory', id);
        return this.prisma.vehicleCategory.delete({ where: { id } });
    }
};
exports.VehicleCategoryService = VehicleCategoryService;
exports.VehicleCategoryService = VehicleCategoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], VehicleCategoryService);
//# sourceMappingURL=vehicle-category.service.js.map
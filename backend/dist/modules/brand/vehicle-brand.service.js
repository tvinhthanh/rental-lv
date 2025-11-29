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
exports.VehicleBrandService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let VehicleBrandService = class VehicleBrandService {
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
                { country: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleBrand.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.vehicleBrand.count({ where })
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
        const item = await this.prisma.vehicleBrand.findUnique({
            where: { id }
        });
        if (!item) {
            throw new common_1.NotFoundException('Brand not found');
        }
        return item;
    }
    async create(dto, actorId) {
        var _a;
        const slug = dto.slug || this.generateSlug(dto.name);
        const exists = await this.prisma.vehicleBrand.findUnique({ where: { slug } });
        if (exists)
            throw new common_1.BadRequestException("Slug already exists");
        const brand = await this.prisma.vehicleBrand.create({
            data: {
                name: dto.name,
                slug,
                country: dto.country,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl || dto.website,
                description: dto.description,
                displayOrder: dto.sortOrder,
                isFeatured: dto.isFeatured,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
                status: (_a = dto.isActive) !== null && _a !== void 0 ? _a : true
            }
        });
        await this.audit.log(actorId, "CREATE", "VehicleBrand", brand.id, brand);
        return brand;
    }
    async update(id, dto, actorId) {
        const brandOld = await this.prisma.vehicleBrand.findUnique({ where: { id } });
        if (!brandOld)
            throw new common_1.NotFoundException("Brand not found");
        let slug = dto.slug;
        if (!slug && dto.name) {
            slug = this.generateSlug(dto.name);
        }
        if (slug && slug !== brandOld.slug) {
            const exists = await this.prisma.vehicleBrand.findUnique({
                where: { slug }
            });
            if (exists)
                throw new common_1.BadRequestException("Slug already exists");
        }
        const brand = await this.prisma.vehicleBrand.update({
            where: { id },
            data: {
                name: dto.name,
                slug,
                country: dto.country,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl || dto.website,
                description: dto.description,
                displayOrder: dto.sortOrder,
                isFeatured: dto.isFeatured,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,
                status: dto.isActive
            }
        });
        await this.audit.log(actorId, "UPDATE", "VehicleBrand", id, brand);
        return brand;
    }
    async delete(id, actorId) {
        const brand = await this.findOne(id);
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'DELETE', 'VehicleBrand', id, brand);
        return this.prisma.vehicleBrand.delete({ where: { id } });
    }
    generateSlug(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
    }
};
exports.VehicleBrandService = VehicleBrandService;
exports.VehicleBrandService = VehicleBrandService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], VehicleBrandService);
//# sourceMappingURL=vehicle-brand.service.js.map
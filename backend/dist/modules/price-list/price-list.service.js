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
exports.PriceListService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let PriceListService = class PriceListService {
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
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }
        const [items, total] = await this.prisma.$transaction([
            this.prisma.priceList.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.priceList.count({ where })
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
        const priceList = await this.prisma.priceList.findUnique({
            where: { id },
            include: { vehicles: true }
        });
        if (!priceList)
            throw new common_1.NotFoundException('Price list not found');
        return priceList;
    }
    async create(dto, actorId) {
        var _a, _b;
        const priceList = await this.prisma.priceList.create({
            data: {
                name: dto.name,
                description: dto.description,
                currency: (_a = dto.currency) !== null && _a !== void 0 ? _a : 'VND',
                dailyRate: dto.dailyRate,
                hourlyRate: dto.hourlyRate,
                weekendRate: dto.weekendRate,
                holidayRate: dto.holidayRate,
                isActive: (_b = dto.isActive) !== null && _b !== void 0 ? _b : true
            }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'CREATE', 'PriceList', priceList.id, priceList);
        return priceList;
    }
    async update(id, dto, actorId) {
        const before = await this.findOne(id);
        const priceList = await this.prisma.priceList.update({
            where: { id },
            data: dto
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'UPDATE', 'PriceList', id, {
            before,
            after: priceList
        });
        return priceList;
    }
    async deactivate(id, actorId) {
        const priceList = await this.prisma.priceList.update({
            where: { id },
            data: { isActive: false }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'DEACTIVATE', 'PriceList', id, priceList);
        return priceList;
    }
    async delete(id, actorId) {
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'DELETE', 'PriceList', id);
        return this.prisma.priceList.delete({ where: { id } });
    }
};
exports.PriceListService = PriceListService;
exports.PriceListService = PriceListService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], PriceListService);
//# sourceMappingURL=price-list.service.js.map
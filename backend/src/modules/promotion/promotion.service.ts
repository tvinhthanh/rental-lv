import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { PromotionQueryDto } from './dto/promotion-query.dto';

@Injectable()
export class PromotionService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    private ensureDiscount(dto: { discountPercent?: number, discountAmount?: number }) {
        if ((dto.discountPercent ?? null) === null && (dto.discountAmount ?? null) === null) {
            throw new BadRequestException('Need discountPercent or discountAmount');
        }
    }

    private validateDateRange(start?: Date | null, end?: Date | null) {
        if (start && end && start > end) {
            throw new BadRequestException('Start date must be before end date');
        }
    }

    private async ensureUniqueCode(code: string, ignoreId?: string) {
        const normalized = code.toUpperCase();
        const existing = await this.prisma.promotion.findUnique({ where: { code: normalized } });
        if (existing && existing.id !== ignoreId) {
            throw new BadRequestException('Promotion code already exists');
        }
    }

    async findAll(query: PromotionQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { code: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.status) where.status = query.status;
        if (query.code) {
            where.code = query.code.trim().toUpperCase();
        }

        if (query.active && query.active === 'true') {
            const now = new Date();
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            where.status = 'ACTIVE';
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { startDate: null },
                        { startDate: { lte: now } }
                    ]
                },
                {
                    OR: [
                        { endDate: null },
                        { endDate: { gte: todayStart } }
                    ]
                }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.promotion.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.promotion.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) throw new NotFoundException('Promotion not found');
        return promotion;
    }

    async create(dto: CreatePromotionDto, actorId?: string) {
        this.ensureDiscount(dto);
        const code = dto.code.trim().toUpperCase();
        await this.ensureUniqueCode(code);

        const startDate = dto.startDate ? new Date(dto.startDate) : null;
        const endDate = dto.endDate ? new Date(dto.endDate) : null;
        this.validateDateRange(startDate, endDate);

        const promotion = await this.prisma.promotion.create({
            data: {
                code,
                name: dto.name,
                description: dto.description,
                discountPercent: dto.discountPercent,
                discountAmount: dto.discountAmount,
                usageLimit: dto.usageLimit,
                startDate: startDate ?? undefined,
                endDate: endDate ?? undefined,
                status: dto.status || 'ACTIVE'
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Promotion', promotion.id, promotion);
        return promotion;
    }

    async update(id: string, dto: UpdatePromotionDto, actorId?: string) {
        const existing = await this.findOne(id);
        const finalCode = dto.code ? dto.code.trim().toUpperCase() : existing.code;

        if (finalCode !== existing.code) {
            await this.ensureUniqueCode(finalCode, id);
        }

        const finalPercent = dto.discountPercent ?? existing.discountPercent;
        const finalAmount = dto.discountAmount ?? existing.discountAmount;
        if (finalPercent == null && finalAmount == null) {
            throw new BadRequestException('Need discountPercent or discountAmount');
        }

        const startDate = dto.startDate ? new Date(dto.startDate) : existing.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : existing.endDate;
        this.validateDateRange(startDate ?? undefined, endDate ?? undefined);

        const promotion = await this.prisma.promotion.update({
            where: { id },
            data: {
                code: finalCode,
                name: dto.name,
                description: dto.description,
                discountPercent: dto.discountPercent,
                discountAmount: dto.discountAmount,
                usageLimit: dto.usageLimit,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                status: dto.status
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Promotion', id, { before: existing, after: promotion });
        return promotion;
    }

    async delete(id: string, actorId?: string) {
        await this.findOne(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'Promotion', id);
        return this.prisma.promotion.delete({ where: { id } });
    }
}

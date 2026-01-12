import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { PricingRuleQueryDto } from './dto/pricing-rule-query.dto';

@Injectable()
export class PricingRuleService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    private validateDateRange(start?: Date | null, end?: Date | null) {
        if (start && end && start > end) {
            throw new BadRequestException('Start date must be before end date');
        }
    }

    async findAll(query: PricingRuleQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.categoryId) where.categoryId = query.categoryId;
        if (query.type) where.type = query.type;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.pricingRule.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: {
                        select: { id: true, name: true }
                    }
                }
            }),
            this.prisma.pricingRule.count({ where })
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
        const item = await this.prisma.pricingRule.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        if (!item) {
            throw new NotFoundException('Pricing rule not found');
        }

        return item;
    }

    async create(dto: CreatePricingRuleDto, userId?: string) {
        if (!dto.percent && !dto.amount) {
            throw new BadRequestException('Need percent or amount');
        }

        this.validateDateRange(
            dto.startDate ? new Date(dto.startDate) : null,
            dto.endDate ? new Date(dto.endDate) : null
        );

        const item = await this.prisma.pricingRule.create({
            data: {
                categoryId: dto.categoryId,
                name: dto.name,
                type: dto.type,
                percent: dto.percent,
                amount: dto.amount,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null
            },
            include: {
                category: true
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'PricingRule', item.id, { name: item.name });
        }

        return item;
    }

    async update(id: string, dto: UpdatePricingRuleDto, userId?: string) {
        await this.findOne(id);

        if (dto.startDate || dto.endDate) {
            const existing = await this.prisma.pricingRule.findUnique({ where: { id } });
            this.validateDateRange(
                dto.startDate ? new Date(dto.startDate) : existing?.startDate,
                dto.endDate ? new Date(dto.endDate) : existing?.endDate
            );
        }

        const item = await this.prisma.pricingRule.update({
            where: { id },
            data: {
                ...(dto.categoryId && { categoryId: dto.categoryId }),
                ...(dto.name && { name: dto.name }),
                ...(dto.type && { type: dto.type }),
                ...(dto.percent !== undefined && { percent: dto.percent }),
                ...(dto.amount !== undefined && { amount: dto.amount }),
                ...(dto.startDate !== undefined && { startDate: dto.startDate ? new Date(dto.startDate) : null }),
                ...(dto.endDate !== undefined && { endDate: dto.endDate ? new Date(dto.endDate) : null })
            },
            include: {
                category: true
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'PricingRule', item.id, { name: item.name });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.pricingRule.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'PricingRule', id);
        }

        return { success: true };
    }
}


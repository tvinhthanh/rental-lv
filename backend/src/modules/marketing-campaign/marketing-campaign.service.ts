import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateMarketingCampaignDto } from './dto/create-marketing-campaign.dto';
import { UpdateMarketingCampaignDto } from './dto/update-marketing-campaign.dto';
import { MarketingCampaignQueryDto } from './dto/marketing-campaign-query.dto';

@Injectable()
export class MarketingCampaignService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: MarketingCampaignQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.status) where.status = query.status;
        if (query.segmentId) where.segmentId = query.segmentId;

        // For MongoDB, use Promise.all instead of transaction for read operations
        const [items, total] = await Promise.all([
            this.prisma.marketingCampaign.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    segment: true,
                    template: true
                }
            }),
            this.prisma.marketingCampaign.count({ where })
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
        const item = await this.prisma.marketingCampaign.findUnique({
            where: { id },
            include: {
                segment: true,
                template: true
            }
        });

        if (!item) {
            throw new NotFoundException('Marketing campaign not found');
        }

        return item;
    }

    async create(dto: CreateMarketingCampaignDto, userId?: string) {
        const item = await this.prisma.marketingCampaign.create({
            data: {
                name: dto.name,
                segmentId: dto.segmentId,
                templateId: dto.templateId,
                status: dto.status || 'DRAFT',
                scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null
            },
            include: {
                segment: true,
                template: true
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'MarketingCampaign', item.id, { name: item.name });
        }

        return item;
    }

    async update(id: string, dto: UpdateMarketingCampaignDto, userId?: string) {
        await this.findOne(id);

        const item = await this.prisma.marketingCampaign.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.segmentId && { segmentId: dto.segmentId }),
                ...(dto.templateId && { templateId: dto.templateId }),
                ...(dto.status && { status: dto.status }),
                ...(dto.scheduledAt !== undefined && { scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null })
            },
            include: {
                segment: true,
                template: true
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'MarketingCampaign', item.id, { name: item.name });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.marketingCampaign.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'MarketingCampaign', id);
        }

        return { success: true };
    }
}


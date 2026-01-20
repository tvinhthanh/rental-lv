import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';

@Injectable()
export class SubscriptionPlanService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll() {
        // For MongoDB, use Promise.all instead of transaction for read operations
        const [items, total] = await Promise.all([
            this.prisma.subscriptionPlan.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { tenants: true }
                    }
                }
            }),
            this.prisma.subscriptionPlan.count()
        ]);

        return {
            items,
            total,
            totalPages: 1
        };
    }

    async findOne(id: string) {
        const item = await this.prisma.subscriptionPlan.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { tenants: true }
                }
            }
        });

        if (!item) {
            throw new NotFoundException('Subscription plan not found');
        }

        return item;
    }

    async create(dto: CreateSubscriptionPlanDto, actorId?: string) {
        const item = await this.prisma.subscriptionPlan.create({
            data: {
                name: dto.name,
                price: dto.price,
                features: dto.features || [],
                duration: dto.duration,
                description: dto.description
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'SubscriptionPlan', item.id, item);
        return item;
    }

    async update(id: string, dto: UpdateSubscriptionPlanDto, actorId?: string) {
        await this.findOne(id);

        const item = await this.prisma.subscriptionPlan.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.price !== undefined && { price: dto.price }),
                ...(dto.features && { features: dto.features }),
                ...(dto.duration !== undefined && { duration: dto.duration }),
                ...(dto.description !== undefined && { description: dto.description })
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'SubscriptionPlan', id, item);
        return item;
    }

    async delete(id: string, actorId?: string) {
        const plan = await this.findOne(id);
        
        // Check if plan has tenants
        const tenantCount = await this.prisma.tenant.count({
            where: { subscriptionId: id }
        });

        if (tenantCount > 0) {
            throw new BadRequestException(`Cannot delete plan with ${tenantCount} active tenant(s)`);
        }

        await this.prisma.subscriptionPlan.delete({
            where: { id }
        });

        await this.audit.log(actorId ?? null, 'DELETE', 'SubscriptionPlan', id, plan);
        return { success: true };
    }
}

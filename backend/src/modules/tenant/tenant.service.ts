import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll() {
        // For MongoDB, use Promise.all instead of transaction for read operations
        const [items, total] = await Promise.all([
            this.prisma.tenant.findMany({
                orderBy: { createdAt: 'desc' },
                include: {
                    subscription: true
                }
            }),
            this.prisma.tenant.count()
        ]);

        return {
            items,
            total,
            totalPages: 1
        };
    }

    async findOne(id: string) {
        const item = await this.prisma.tenant.findUnique({
            where: { id },
            include: {
                subscription: true
            }
        });

        if (!item) {
            throw new NotFoundException('Tenant not found');
        }

        return item;
    }

    async create(dto: CreateTenantDto, actorId?: string) {
        // Validate subscription exists
        const subscription = await this.prisma.subscriptionPlan.findUnique({
            where: { id: dto.subscriptionId }
        });

        if (!subscription) {
            throw new NotFoundException('Subscription plan not found');
        }

        // Check subdomain uniqueness if provided
        if (dto.subdomain) {
            const existing = await this.prisma.tenant.findUnique({
                where: { subdomain: dto.subdomain }
            });

            if (existing) {
                throw new BadRequestException('Subdomain already exists');
            }
        }

        const item = await this.prisma.tenant.create({
            data: {
                name: dto.name,
                subdomain: dto.subdomain,
                customDomain: dto.customDomain,
                subscriptionId: dto.subscriptionId
            },
            include: {
                subscription: true
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Tenant', item.id, item);
        return item;
    }

    async update(id: string, dto: UpdateTenantDto, actorId?: string) {
        await this.findOne(id);

        // Check subdomain uniqueness if changing
        if (dto.subdomain) {
            const existing = await this.prisma.tenant.findUnique({
                where: { subdomain: dto.subdomain }
            });

            if (existing && existing.id !== id) {
                throw new BadRequestException('Subdomain already exists');
            }
        }

        const item = await this.prisma.tenant.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.subdomain !== undefined && { subdomain: dto.subdomain }),
                ...(dto.customDomain !== undefined && { customDomain: dto.customDomain }),
                ...(dto.subscriptionId && { subscriptionId: dto.subscriptionId })
            },
            include: {
                subscription: true
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Tenant', id, item);
        return item;
    }

    async delete(id: string, actorId?: string) {
        const tenant = await this.findOne(id);
        
        await this.prisma.tenant.delete({
            where: { id }
        });

        await this.audit.log(actorId ?? null, 'DELETE', 'Tenant', id, tenant);
        return { success: true };
    }
}

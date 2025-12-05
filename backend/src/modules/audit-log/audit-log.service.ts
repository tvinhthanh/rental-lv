import { Injectable } from '@nestjs/common';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AuditLogService {
    constructor(private prisma: PrismaService) { }

    // WRITE LOG (called by other modules)
    async log(
        userId: string | null | undefined,
        action: string,
        module: string,
        entityId?: string | null,
        metadata?: any,
        entityType?: string | null
    ) {
        return this.prisma.auditLog.create({
            data: {
                userId: userId ?? null,
                action,
                module,
                entityId: entityId ?? null,
                entityType: entityType ?? module, // Default to module name if not provided
                metadata
            }
        });
    }


    async findAll(query: AuditLogQueryDto) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.userId) where.userId = query.userId;
        if (query.module) where.module = query.module;
        if (query.action) where.action = query.action;
        if (query.entityId) where.entityId = query.entityId;

        if (query.search) {
            where.metadata = {
                contains: query.search,
                mode: 'insensitive'
            };
        }

        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.auditLog.count({ where })
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
        return this.prisma.auditLog.findUnique({ where: { id } });
    }
}

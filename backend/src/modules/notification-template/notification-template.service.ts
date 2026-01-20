import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { NotificationTemplateQueryDto } from './dto/notification-template-query.dto';

@Injectable()
export class NotificationTemplateService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    private async ensureUniqueCode(code: string, ignoreId?: string) {
        const normalized = code.toUpperCase();
        const existing = await this.prisma.notificationTemplate.findUnique({ where: { code: normalized } });
        if (existing && existing.id !== ignoreId) {
            throw new BadRequestException('Template code already exists');
        }
    }

    async findAll(query: NotificationTemplateQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { code: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
                { subject: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.type) where.type = query.type;
        if (query.code) {
            where.code = query.code.trim().toUpperCase();
        }

        // For MongoDB, use Promise.all instead of transaction for read operations
        const [items, total] = await Promise.all([
            this.prisma.notificationTemplate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.notificationTemplate.count({ where })
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
        const item = await this.prisma.notificationTemplate.findUnique({
            where: { id }
        });

        if (!item) {
            throw new NotFoundException('Notification template not found');
        }

        return item;
    }

    async findByCode(code: string) {
        const item = await this.prisma.notificationTemplate.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!item) {
            throw new NotFoundException('Notification template not found');
        }

        return item;
    }

    async create(dto: CreateNotificationTemplateDto, userId?: string) {
        await this.ensureUniqueCode(dto.code);

        const item = await this.prisma.notificationTemplate.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                subject: dto.subject,
                content: dto.content,
                type: dto.type
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'NotificationTemplate', item.id, { code: item.code });
        }

        return item;
    }

    async update(id: string, dto: UpdateNotificationTemplateDto, userId?: string) {
        await this.findOne(id);

        if (dto.code) {
            await this.ensureUniqueCode(dto.code, id);
        }

        const item = await this.prisma.notificationTemplate.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.code && { code: dto.code.toUpperCase() }),
                ...(dto.subject !== undefined && { subject: dto.subject }),
                ...(dto.content !== undefined && { content: dto.content }),
                ...(dto.type && { type: dto.type })
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'NotificationTemplate', item.id, { code: item.code });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.notificationTemplate.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'NotificationTemplate', id);
        }

        return { success: true };
    }
}


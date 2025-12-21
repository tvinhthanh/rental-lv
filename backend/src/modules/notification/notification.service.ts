import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService,
        private gateway: NotificationGateway
    ) { }

    async findAll(query: NotificationQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.userId) where.userId = query.userId;
        if (query.status) where.status = query.status;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.notification.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true
                        }
                    },
                    template: true
                }
            }),
            this.prisma.notification.count({ where })
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
        const notification = await this.prisma.notification.findUnique({
            where: { id },
            include: {
                user: true,
                template: true
            }
        });
        if (!notification) throw new NotFoundException('Notification not found');
        return notification;
    }

    async create(dto: CreateNotificationDto, emitSocket = true) {
        // Validate user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId }
        });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                templateId: dto.templateId,
                title: dto.title,
                message: dto.message,
                status: dto.status || 'UNREAD'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true
                    }
                },
                template: true
            }
        });

        // Emit socket event để frontend nhận real-time
        if (emitSocket) {
            this.gateway.emitToUser(dto.userId, 'notification', {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                status: notification.status,
                createdAt: notification.createdAt
            });
        }

        await this.audit.log(null, 'CREATE', 'Notification', notification.id, notification);
        return notification;
    }

    async markAsRead(id: string, userId?: string) {
        const notification = await this.findOne(id);

        // Check if user owns this notification
        if (userId && notification.userId !== userId) {
            throw new BadRequestException('You can only mark your own notifications as read');
        }

        const updated = await this.prisma.notification.update({
            where: { id },
            data: { status: 'READ' },
            include: {
                user: true,
                template: true
            }
        });

        await this.audit.log(userId ?? null, 'UPDATE', 'Notification', id, { status: 'READ' });
        return updated;
    }

    async markAllAsRead(userId: string) {
        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                status: 'UNREAD'
            },
            data: {
                status: 'READ'
            }
        });

        await this.audit.log(userId, 'UPDATE', 'Notification', 'all', { action: 'mark_all_read' });
        return { count: result.count };
    }

    async update(id: string, dto: UpdateNotificationDto, actorId?: string) {
        const existing = await this.findOne(id);

        const notification = await this.prisma.notification.update({
            where: { id },
            data: dto,
            include: {
                user: true,
                template: true
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Notification', id, {
            before: existing,
            after: notification
        });
        return notification;
    }

    async delete(id: string, actorId?: string) {
        await this.findOne(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'Notification', id);
        return this.prisma.notification.delete({ where: { id } });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                status: 'UNREAD'
            }
        });
    }
}


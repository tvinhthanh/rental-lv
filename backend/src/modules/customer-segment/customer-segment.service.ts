import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCustomerSegmentDto } from './dto/create-customer-segment.dto';
import { UpdateCustomerSegmentDto } from './dto/update-customer-segment.dto';
import { CustomerSegmentQueryDto } from './dto/customer-segment-query.dto';

@Injectable()
export class CustomerSegmentService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: CustomerSegmentQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.customerSegment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { campaigns: true }
                    }
                }
            }),
            this.prisma.customerSegment.count({ where })
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
        const item = await this.prisma.customerSegment.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { campaigns: true }
                }
            }
        });

        if (!item) {
            throw new NotFoundException('Customer segment not found');
        }

        return item;
    }

    async create(dto: CreateCustomerSegmentDto, userId?: string) {
        const item = await this.prisma.customerSegment.create({
            data: {
                name: dto.name,
                conditions: dto.conditions,
                description: dto.description
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'CustomerSegment', item.id, { name: item.name });
        }

        return item;
    }

    async update(id: string, dto: UpdateCustomerSegmentDto, userId?: string) {
        await this.findOne(id);

        const item = await this.prisma.customerSegment.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.conditions && { conditions: dto.conditions }),
                ...(dto.description !== undefined && { description: dto.description })
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'CustomerSegment', item.id, { name: item.name });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.customerSegment.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'CustomerSegment', id);
        }

        return { success: true };
    }
}


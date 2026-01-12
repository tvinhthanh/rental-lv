import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateLoyaltyProgramDto } from './dto/create-loyalty-program.dto';
import { UpdateLoyaltyProgramDto } from './dto/update-loyalty-program.dto';
import { LoyaltyProgramQueryDto } from './dto/loyalty-program-query.dto';

@Injectable()
export class LoyaltyProgramService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: LoyaltyProgramQueryDto) {
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
            this.prisma.loyaltyProgram.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { transactions: true }
                    }
                }
            }),
            this.prisma.loyaltyProgram.count({ where })
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
        const item = await this.prisma.loyaltyProgram.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { transactions: true }
                }
            }
        });

        if (!item) {
            throw new NotFoundException('Loyalty program not found');
        }

        return item;
    }

    async create(dto: CreateLoyaltyProgramDto, userId?: string) {
        const item = await this.prisma.loyaltyProgram.create({
            data: {
                name: dto.name,
                minAmount: dto.minAmount,
                pointsPer100k: dto.pointsPer100k,
                description: dto.description
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'LoyaltyProgram', item.id, { name: item.name });
        }

        return item;
    }

    async update(id: string, dto: UpdateLoyaltyProgramDto, userId?: string) {
        await this.findOne(id);

        const item = await this.prisma.loyaltyProgram.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.minAmount !== undefined && { minAmount: dto.minAmount }),
                ...(dto.pointsPer100k !== undefined && { pointsPer100k: dto.pointsPer100k }),
                ...(dto.description !== undefined && { description: dto.description })
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'LoyaltyProgram', item.id, { name: item.name });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.loyaltyProgram.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'LoyaltyProgram', id);
        }

        return { success: true };
    }
}


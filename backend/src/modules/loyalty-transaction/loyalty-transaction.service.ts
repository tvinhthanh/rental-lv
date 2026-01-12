import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateLoyaltyTransactionDto } from './dto/create-loyalty-transaction.dto';
import { LoyaltyTransactionQueryDto } from './dto/loyalty-transaction-query.dto';

@Injectable()
export class LoyaltyTransactionService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: LoyaltyTransactionQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.customerId) where.customerId = query.customerId;
        if (query.programId) where.programId = query.programId;
        if (query.bookingId) where.bookingId = query.bookingId;
        if (query.type) where.type = query.type;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.loyaltyTransaction.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    customer: {
                        select: { id: true, fullName: true, email: true }
                    },
                    program: true,
                    booking: {
                        select: { id: true, bookingCode: true }
                    }
                }
            }),
            this.prisma.loyaltyTransaction.count({ where })
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
        const item = await this.prisma.loyaltyTransaction.findUnique({
            where: { id },
            include: {
                customer: true,
                program: true,
                booking: true
            }
        });

        if (!item) {
            throw new NotFoundException('Loyalty transaction not found');
        }

        return item;
    }

    async create(dto: CreateLoyaltyTransactionDto, userId?: string) {
        // Check customer exists
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId }
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // If redeem, check balance
        if (dto.type === 'redeem') {
            const currentPoints = customer.loyaltyPoints || 0;
            if (currentPoints < dto.points) {
                throw new BadRequestException('Insufficient loyalty points');
            }
        }

        const item = await this.prisma.loyaltyTransaction.create({
            data: {
                customerId: dto.customerId,
                programId: dto.programId,
                bookingId: dto.bookingId,
                type: dto.type,
                points: dto.type === 'redeem' ? -dto.points : dto.points,
                note: dto.note
            },
            include: {
                customer: true,
                program: true,
                booking: true
            }
        });

        // Update customer points
        const newPoints = dto.type === 'redeem' 
            ? (customer.loyaltyPoints || 0) - dto.points
            : (customer.loyaltyPoints || 0) + dto.points;

        await this.prisma.customer.update({
            where: { id: dto.customerId },
            data: { loyaltyPoints: Math.max(0, newPoints) }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'LoyaltyTransaction', item.id, { type: dto.type, points: dto.points });
        }

        return item;
    }
}


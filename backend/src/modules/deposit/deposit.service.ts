import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';
import { RefundDepositDto } from './dto/refund-deposit.dto';
import { ApplySurchargeDto } from './dto/apply-surcharge.dto';

@Injectable()
export class DepositService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.deposit.findUnique({
            where: { bookingId },
            include: {
                items: true,
                booking: {
                    include: {
                        customer: true,
                        vehicle: {
                            include: {
                                category: true,
                                branch: true
                            }
                        },
                        branch: true
                    }
                },
                customer: true
            }
        });
    }

    async create(dto: CreateDepositDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId }
        });
        if (!customer) throw new NotFoundException('Customer not found');

        const exists = await this.prisma.deposit.findUnique({
            where: { bookingId: dto.bookingId }
        });
        if (exists) {
            throw new BadRequestException('Deposit already exists for this booking');
        }

        const deposit = await this.prisma.deposit.create({
            data: {
                bookingId: dto.bookingId,
                customerId: dto.customerId,
                totalAmount: dto.totalAmount,
                usedAmount: 0,
                refundedAmount: 0,
                paymentMethod: dto.paymentMethod,
                status: dto.status ?? 'HELD',
                notes: dto.notes
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Deposit', deposit.id, deposit);

        // Check nếu đã có handover → chuyển booking sang ONGOING
        const handover = await this.prisma.handover.findUnique({
            where: { bookingId: dto.bookingId }
        });

        if (handover) {
            await this.prisma.booking.update({
                where: { id: dto.bookingId },
                data: { status: 'ONGOING' }
            });
        }

        return deposit;
    }

    async addDetail(dto: CreateDepositDetailDto, actorId?: string) {
        const deposit = await this.prisma.deposit.findUnique({
            where: { id: dto.depositId }
        });
        if (!deposit) throw new NotFoundException('Deposit not found');

        const detail = await this.prisma.depositDetail.create({
            data: {
                depositId: dto.depositId,
                itemType: dto.itemType,
                itemName: dto.itemName,
                identifier: dto.identifier,
                amount: dto.amount,
                condition: dto.condition,
                photoUrls: dto.photoUrls ?? [],
                notes: dto.notes
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE_DETAIL', 'Deposit', deposit.id, detail);
        return detail;
    }

    async listDetails(depositId: string) {
        return this.prisma.depositDetail.findMany({
            where: { depositId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async refund(id: string, dto: RefundDepositDto, actorId?: string) {
        const deposit = await this.prisma.deposit.findUnique({
            where: { id },
            select: {
                id: true,
                totalAmount: true,
                usedAmount: true,
                refundedAmount: true,
                status: true
            }
        });
        if (!deposit) throw new NotFoundException('Deposit not found');

        const remaining = deposit.totalAmount - deposit.usedAmount - deposit.refundedAmount;
        if (dto.amount > remaining) throw new BadRequestException('Refund exceeds remaining deposit');

        const updateData: any = {
            refundedAmount: deposit.refundedAmount + dto.amount,
            status: deposit.refundedAmount + dto.amount >= deposit.totalAmount ? 'REFUNDED' : deposit.status
        };

        const updated = await this.prisma.deposit.update({
            where: { id },
            data: updateData
        });

        await this.prisma.depositDetail.create({
            data: {
                depositId: id,
                itemType: 'REFUND',
                amount: -dto.amount,
                notes: dto.note ?? 'Refund to customer'
            }
        });

        await this.audit.log(actorId ?? null, 'REFUND', 'Deposit', id, {
            amount: dto.amount,
            before: deposit,
            after: updated
        });

        return updated;
    }

    async applySurcharge(id: string, dto: ApplySurchargeDto, actorId?: string) {
        const deposit = await this.prisma.deposit.findUnique({
            where: { id },
            select: {
                id: true,
                totalAmount: true,
                usedAmount: true,
                refundedAmount: true,
                status: true
            }
        });
        if (!deposit) throw new NotFoundException('Deposit not found');

        const remaining = deposit.totalAmount - deposit.usedAmount - deposit.refundedAmount;
        if (dto.amount > remaining) throw new BadRequestException('Amount exceeds remaining deposit');

        const updated = await this.prisma.deposit.update({
            where: { id },
            data: {
                usedAmount: deposit.usedAmount + dto.amount
            }
        });

        await this.prisma.depositDetail.create({
            data: {
                depositId: id,
                itemType: 'SURCHARGE',
                surchargeId: dto.surchargeId,
                identifier: dto.surchargeId,
                amount: -dto.amount,
                notes: dto.note ?? 'Applied to surcharge'
            }
        });

        await this.audit.log(actorId ?? null, 'APPLY_SURCHARGE', 'Deposit', id, {
            surchargeId: dto.surchargeId,
            amount: dto.amount,
            before: deposit,
            after: updated
        });

        return updated;
    }

    async findByBranch(branchId: string) {
        const [items, total] = await Promise.all([
            this.prisma.deposit.findMany({
                where: {
                    booking: {
                        branchId
                    }
                },
                include: {
                    booking: {
                        include: {
                            customer: true,
                            vehicle: {
                                include: {
                                    category: true,
                                    branch: true
                                }
                            },
                            branch: true
                        }
                    },
                    customer: true,
                    items: true
                },
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.deposit.count({
                where: {
                    booking: {
                        branchId
                    }
                }
            })
        ]);

        return {
            items,
            total
        };
    }
}

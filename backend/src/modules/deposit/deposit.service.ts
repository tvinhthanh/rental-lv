import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';

@Injectable()
export class DepositService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.deposit.findUnique({
            where: { bookingId },
            include: { items: true }
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
                status: dto.status ?? 'HELD',
                notes: dto.notes
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Deposit', deposit.id, deposit);
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
}

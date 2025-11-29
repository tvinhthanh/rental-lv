import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateReturnReportDto } from './dto/create-return-report.dto';

@Injectable()
export class ReturnReportService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.returnReport.findUnique({
            where: { bookingId },
            include: {
                booking: true,
                returnBranch: true
            }
        });
    }

    async create(dto: CreateReturnReportDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: { invoice: true }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        const handover = await this.prisma.handover.findUnique({
            where: { bookingId: dto.bookingId }
        });
        if (!handover) throw new BadRequestException('Handover not found for this booking');

        const existing = await this.prisma.returnReport.findUnique({
            where: { bookingId: dto.bookingId }
        });

        const data = {
            bookingId: dto.bookingId,
            odoEnd: dto.odoEnd,
            fuelLevelEnd: dto.fuelLevelEnd,
            damageNote: dto.damageNote,
            extraCharge: dto.extraCharge,
            condition: dto.condition,
            checklist: dto.checklist,
            returnBranchId: dto.returnBranchId,
            note: dto.note,
            photoUrls: dto.photoUrls ?? [],
        };

        let report;

        if (existing) {
            report = await this.prisma.returnReport.update({
                where: { bookingId: dto.bookingId },
                data
            });
            await this.audit.log(actorId ?? null, 'UPDATE', 'ReturnReport', existing.id, { before: existing, after: report });
        } else {
            report = await this.prisma.returnReport.create({ data });
            await this.audit.log(actorId ?? null, 'CREATE', 'ReturnReport', report.id, report);
        }

        // Auto generate surcharges if invoice exists
        if (booking.invoice) {
            const invoiceId = booking.invoice.id;
            const surchargesToCreate: Array<{ name: string; amount: number; description?: string }> = [];

            // Fuel shortage
            if (handover.fuelLevelStart !== null && dto.fuelLevelEnd !== undefined) {
                const fuelDeficit = Math.max(0, (handover.fuelLevelStart ?? 0) - (dto.fuelLevelEnd ?? 0));
                const fuelAmount = dto.fuelSurchargeAmount
                    ?? (dto.fuelPricePerPercent ? fuelDeficit * dto.fuelPricePerPercent : 0);

                if (fuelAmount > 0) {
                    surchargesToCreate.push({
                        name: 'Fuel shortage',
                        amount: fuelAmount,
                        description: 'Fuel level on return is lower than pickup'
                    });
                }
            }

            // Over mileage
            if (handover.odoStart !== null && dto.odoEnd !== undefined) {
                const allowedKm = dto.allowedKm ?? 0;
                const totalDelta = (dto.odoEnd ?? 0) - (handover.odoStart ?? 0);
                const excess = Math.max(0, totalDelta - allowedKm);
                const overKmAmount = dto.overKmSurchargeAmount
                    ?? (dto.overKmPricePerKm && excess > 0 ? excess * dto.overKmPricePerKm : 0);

                if (overKmAmount > 0) {
                    surchargesToCreate.push({
                        name: 'Over mileage',
                        amount: overKmAmount,
                        description: `Exceeded allowed km by ${excess}km`
                    });
                }
            }

            // Damage fee
            const damageAmount = dto.damageSurchargeAmount ?? dto.damageCharge ?? 0;
            if (damageAmount > 0 && dto.damageNote) {
                surchargesToCreate.push({
                    name: 'Damage fee',
                    amount: damageAmount,
                    description: dto.damageNote
                });
            }

            for (const item of surchargesToCreate) {
                await this.prisma.surcharge.create({
                    data: {
                        invoiceId,
                        name: item.name,
                        description: item.description,
                        amount: item.amount
                    }
                });
            }

            if (surchargesToCreate.length > 0) {
                const surchargeAgg = await this.prisma.surcharge.aggregate({
                    where: { invoiceId },
                    _sum: { amount: true }
                });

                const surchargeTotal = surchargeAgg._sum.amount ?? 0;
                const subtotal = booking.invoice.subtotal ?? 0;
                const discountTotal = booking.invoice.discountTotal ?? 0;

                await this.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        surchargeTotal,
                        totalAmount: subtotal + surchargeTotal - discountTotal
                    }
                });
            }
        }

        return report;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateHandoverDto } from './dto/create-handover.dto';

@Injectable()
export class HandoverService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findByBooking(bookingId: string) {
        return this.prisma.handover.findUnique({
            where: { bookingId },
            include: { booking: true }
        });
    }

    async create(dto: CreateHandoverDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId }
        });
        if (!booking) throw new NotFoundException('Booking not found');

        const existing = await this.prisma.handover.findUnique({
            where: { bookingId: dto.bookingId }
        });

        if (existing) {
            const updated = await this.prisma.handover.update({
                where: { bookingId: dto.bookingId },
                data: {
                    ...dto,
                    photoUrls: dto.photoUrls ?? existing.photoUrls
                }
            });

            await this.audit.log(actorId ?? null, 'UPDATE', 'Handover', existing.id, {
                before: existing,
                after: updated
            });

            return updated;
        }

        const handover = await this.prisma.handover.create({
            data: {
                ...dto,
                photoUrls: dto.photoUrls ?? []
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Handover', handover.id, handover);
        return handover;
    }
}

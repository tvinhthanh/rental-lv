import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Processor('booking-queue')
export class BookingProcessor {
    private readonly logger = new Logger(BookingProcessor.name);

    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) {}

    @Process('auto-cancel')
    async handleAutoCancel(job: Job<{ bookingId: string }>) {
        const { bookingId } = job.data;
        this.logger.log(`Processing auto-cancel job for Booking ID: ${bookingId}`);

        try {
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId }
            });

            if (!booking) {
                this.logger.warn(`Booking with ID ${bookingId} not found. Skipping auto-cancel.`);
                return;
            }

            // Only auto-cancel if booking is still PENDING (not confirmed, ongoing, or already cancelled/completed)
            if (booking.status === 'PENDING') {
                const updated = await this.prisma.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'CANCELLED',
                        cancelReason: 'Tự động hủy do quá thời gian giữ xe/chưa đặt cọc.'
                    }
                });

                await this.audit.log(
                    null, // System action
                    'CANCEL',
                    'Booking',
                    bookingId,
                    { reason: 'Tự động hủy (Bull Queue Timeout)', before: booking, after: updated }
                );

                this.logger.log(`Booking ID ${bookingId} successfully auto-cancelled.`);
            } else {
                this.logger.log(`Booking ID ${bookingId} status is ${booking.status}. No action taken.`);
            }
        } catch (error: any) {
            this.logger.error(`Failed to process auto-cancel for booking ${bookingId}: ${error?.message || error}`);
            throw error; // Re-throw so Bull knows the job failed
        }
    }
}

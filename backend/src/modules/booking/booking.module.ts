import { Module, forwardRef } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { NotificationModule } from '../notification/notification.module';
import { BullModule } from '@nestjs/bull';
import { BookingProcessor } from './booking.processor';

@Module({
    imports: [
        forwardRef(() => NotificationModule),
        BullModule.registerQueue({
            name: 'booking-queue',
        }),
    ],
    controllers: [BookingController],
    providers: [BookingService, BookingProcessor, PrismaService, AuditLogService],
    exports: [BookingService, BullModule]
})
export class BookingModule { }

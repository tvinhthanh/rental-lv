import { Module } from '@nestjs/common';
import { CustomerSegmentController } from './customer-segment.controller';
import { CustomerSegmentService } from './customer-segment.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [CustomerSegmentController],
    providers: [CustomerSegmentService, PrismaService, AuditLogService],
    exports: [CustomerSegmentService]
})
export class CustomerSegmentModule { }


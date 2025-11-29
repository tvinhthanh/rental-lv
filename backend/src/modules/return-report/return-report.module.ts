import { Module } from '@nestjs/common';
import { ReturnReportService } from './return-report.service';
import { ReturnReportController } from './return-report.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [ReturnReportController],
    providers: [ReturnReportService, PrismaService, AuditLogService],
    exports: [ReturnReportService]
})
export class ReturnReportModule { }

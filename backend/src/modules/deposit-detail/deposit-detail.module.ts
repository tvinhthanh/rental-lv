import { Module } from '@nestjs/common';
import { DepositDetailController } from './deposit-detail.controller';
import { DepositDetailService } from './deposit-detail.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [DepositDetailController],
    providers: [DepositDetailService, PrismaService, AuditLogService],
    exports: [DepositDetailService]
})
export class DepositDetailModule { }


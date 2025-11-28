import { Module } from '@nestjs/common';
import { DepositController } from './deposit.controller';
import { DepositService } from './deposit.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [DepositController],
    providers: [DepositService, PrismaService, AuditLogService],
    exports: [DepositService]
})
export class DepositModule { }

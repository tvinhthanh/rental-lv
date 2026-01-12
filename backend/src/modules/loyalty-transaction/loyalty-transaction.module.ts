import { Module } from '@nestjs/common';
import { LoyaltyTransactionController } from './loyalty-transaction.controller';
import { LoyaltyTransactionService } from './loyalty-transaction.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [LoyaltyTransactionController],
    providers: [LoyaltyTransactionService, PrismaService, AuditLogService],
    exports: [LoyaltyTransactionService]
})
export class LoyaltyTransactionModule { }


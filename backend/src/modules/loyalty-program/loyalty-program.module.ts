import { Module } from '@nestjs/common';
import { LoyaltyProgramController } from './loyalty-program.controller';
import { LoyaltyProgramService } from './loyalty-program.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [LoyaltyProgramController],
    providers: [LoyaltyProgramService, PrismaService, AuditLogService],
    exports: [LoyaltyProgramService]
})
export class LoyaltyProgramModule { }


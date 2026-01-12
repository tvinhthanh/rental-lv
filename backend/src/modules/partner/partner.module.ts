import { Module } from '@nestjs/common';
import { PartnerController } from './partner.controller';
import { PartnerService } from './partner.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [PartnerController],
    providers: [PartnerService, PrismaService, AuditLogService],
    exports: [PartnerService]
})
export class PartnerModule { }


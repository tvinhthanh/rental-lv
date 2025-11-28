import { Module } from '@nestjs/common';
import { HandoverController } from './handover.controller';
import { HandoverService } from './handover.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [HandoverController],
    providers: [HandoverService, PrismaService, AuditLogService],
    exports: [HandoverService]
})
export class HandoverModule { }

import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [MaintenanceController],
    providers: [MaintenanceService, PrismaService, AuditLogService],
    exports: [MaintenanceService]
})
export class MaintenanceModule { }

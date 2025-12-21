import { Module } from '@nestjs/common';
import { VehicleDocumentController } from './vehicle-document.controller';
import { VehicleDocumentService } from './vehicle-document.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [VehicleDocumentController],
    providers: [VehicleDocumentService, PrismaService, AuditLogService],
    exports: [VehicleDocumentService]
})
export class VehicleDocumentModule { }


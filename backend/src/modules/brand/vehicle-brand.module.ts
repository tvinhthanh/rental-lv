import { Module } from '@nestjs/common';
import { VehicleBrandController } from './vehicle-brand.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { VehicleBrandService } from './vehicle-brand.service';

@Module({
    controllers: [VehicleBrandController],
    providers: [VehicleBrandService, PrismaService, AuditLogService],
})
export class VehicleBrandModule { }

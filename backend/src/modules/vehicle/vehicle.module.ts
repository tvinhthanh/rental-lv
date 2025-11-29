import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { VehicleService } from './vehicle.service';
import { VehicleController } from './vehicle.controller';
import { VehicleBrandService } from '../brand/vehicle-brand.service';

@Module({
    controllers: [VehicleController],
    providers: [VehicleService, PrismaService, AuditLogService, VehicleBrandService],
    exports: [VehicleService]
})
export class VehicleModule { }

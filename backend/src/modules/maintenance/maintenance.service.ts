import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(vehicleId?: string) {
        const where: any = {};
        if (vehicleId) where.vehicleId = vehicleId;

        return this.prisma.maintenance.findMany({
            where,
            orderBy: { maintenanceDate: 'desc' }
        });
    }

    async findOne(id: string) {
        const item = await this.prisma.maintenance.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Maintenance not found');
        return item;
    }

    async create(dto: CreateMaintenanceDto, actorId?: string) {
        // Validate vehicle exists
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id: dto.vehicleId } });
        if (!vehicle) throw new NotFoundException('Vehicle not found');

        const maintenance = await this.prisma.maintenance.create({
            data: {
                vehicleId: dto.vehicleId,
                title: dto.title,
                description: dto.description,
                maintenanceDate: new Date(dto.maintenanceDate),
                odometer: dto.odometer,
                performedBy: dto.performedBy,
                cost: dto.cost,
                status: dto.status ?? 'PENDING',
                nextMaintenanceAt: dto.nextMaintenanceAt
                    ? new Date(dto.nextMaintenanceAt)
                    : undefined,
            }
        });

        await this.prisma.vehicle.update({
            where: { id: dto.vehicleId },
            data: { status: "MAINTENANCE" }
        });

        await this.audit.log(
            actorId ?? null,
            'CREATE',
            'Maintenance',
            maintenance.id,
            maintenance
        );

        return maintenance;
    }

    async update(id: string, dto: UpdateMaintenanceDto, actorId?: string) {
        const before = await this.findOne(id);

        const updated = await this.prisma.maintenance.update({
            where: { id },
            data: {
                title: dto.title,
                description: dto.description,
                maintenanceDate: dto.maintenanceDate ? new Date(dto.maintenanceDate) : undefined,
                odometer: dto.odometer,
                performedBy: dto.performedBy,
                cost: dto.cost,
                status: dto.status,
                nextMaintenanceAt: dto.nextMaintenanceAt ? new Date(dto.nextMaintenanceAt) : undefined
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Maintenance', id, { before, after: updated });
        return updated;
    }

    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Maintenance', id);
        return this.prisma.maintenance.delete({ where: { id } });
    }

    async findByBranch(branchId: string) {
        return this.prisma.maintenance.findMany({
            where: {
                vehicle: {
                    branchId: branchId,
                },
            },
            include: {
                vehicle: true,
            }
        });
    }

    async findByStatus(branchId: string, status: string) {
        return this.prisma.maintenance.findMany({
            where: {
                vehicle: {
                    branchId: branchId,
                    status: status,
                }
            }
        });
    }

    async findByVehicle(vehicleId: string) {
        return this.prisma.maintenance.findMany({ where: { vehicleId } });
    }

    async completeMaintenance(id: string) {
        const maintenance = await this.findOne(id);

        // update maintenance
        const updated = await this.prisma.maintenance.update({
            where: { id },
            data: {
                status: "DONE",
                updatedAt: new Date(),
            },
        });

        // update vehicle
        await this.prisma.vehicle.update({
            where: { id: maintenance.vehicleId },
            data: {
                status: "AVAILABLE",
            },
        });

        return updated;
    }

}

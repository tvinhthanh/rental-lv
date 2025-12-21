import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVehicleDocumentDto } from './dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from './dto/update-vehicle-document.dto';
import { VehicleDocumentQueryDto } from './dto/vehicle-document-query.dto';

@Injectable()
export class VehicleDocumentService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: VehicleDocumentQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.vehicleId) where.vehicleId = query.vehicleId;
        if (query.docType) where.docType = query.docType;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleDocument.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    vehicle: {
                        select: {
                            id: true,
                            name: true,
                            licensePlate: true
                        }
                    }
                }
            }),
            this.prisma.vehicleDocument.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async findOne(id: string) {
        const doc = await this.prisma.vehicleDocument.findUnique({
            where: { id },
            include: {
                vehicle: true
            }
        });
        if (!doc) throw new NotFoundException('Vehicle document not found');
        return doc;
    }

    async create(dto: CreateVehicleDocumentDto, actorId?: string) {
        // Validate vehicle exists
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id: dto.vehicleId }
        });
        if (!vehicle) {
            throw new BadRequestException('Vehicle not found');
        }

        const doc = await this.prisma.vehicleDocument.create({
            data: {
                vehicleId: dto.vehicleId,
                docType: dto.docType,
                documentName: dto.documentName,
                number: dto.number,
                fileUrl: dto.fileUrl,
                issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                notes: dto.notes
            },
            include: {
                vehicle: true
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'VehicleDocument', doc.id, doc);
        return doc;
    }

    async update(id: string, dto: UpdateVehicleDocumentDto, actorId?: string) {
        const existing = await this.findOne(id);

        const doc = await this.prisma.vehicleDocument.update({
            where: { id },
            data: {
                docType: dto.docType,
                documentName: dto.documentName,
                number: dto.number,
                fileUrl: dto.fileUrl,
                issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : undefined,
                expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
                notes: dto.notes
            },
            include: {
                vehicle: true
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'VehicleDocument', id, {
            before: existing,
            after: doc
        });
        return doc;
    }

    async delete(id: string, actorId?: string) {
        await this.findOne(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'VehicleDocument', id);
        return this.prisma.vehicleDocument.delete({ where: { id } });
    }
}


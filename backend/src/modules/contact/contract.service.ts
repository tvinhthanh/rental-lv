import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { randomBytes } from 'crypto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class ContractService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService,
        private cloudinary: CloudinaryService
    ) { }

    generateContractNo() {
        return 'CTR-' + randomBytes(4).toString('hex').toUpperCase();
    }

    async findOne(id: string) {
        const c = await this.prisma.contract.findUnique({
            where: { id },
            include: {
                booking: {
                    include: {
                        customer: true,
                        vehicle: true,
                        branch: true
                    }
                }
            }
        });
        if (!c) throw new NotFoundException('Contract not found');
        return c;
    }

    async findByBooking(bookingId: string) {
        return this.prisma.contract.findUnique({
            where: { bookingId },
            include: {
                booking: {
                    include: {
                        customer: true,
                        vehicle: true,
                        branch: true
                    }
                }
            }
        });
    }

    async create(dto: CreateContractDto, actorId?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId },
            include: {
                customer: true,
                vehicle: true,
                branch: true
            }
        });

        if (!booking) throw new NotFoundException('Booking not found');

        const exists = await this.findByBooking(dto.bookingId);
        if (exists) throw new BadRequestException('Contract already exists for this booking');

        const contract = await this.prisma.contract.create({
            data: {
                bookingId: dto.bookingId,
                contractNo: this.generateContractNo(),
                startDate: dto.startDate ? new Date(dto.startDate) : booking.pickupDate,
                endDate: dto.endDate ? new Date(dto.endDate) : booking.returnDate,
                totalAmount: dto.totalAmount ?? booking.totalAmount,
                depositAmount: dto.depositAmount,
                terms: dto.terms ?? 'Default rental contract terms...',
                notes: dto.notes,
                customerSignature: dto.customerSignature,
                employeeSignature: dto.employeeSignature,
                signedBy: dto.signedBy,
                fileUrl: dto.fileUrl,
                status: 'DRAFT'
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Contract', contract.id, contract);

        return contract;
    }

    async update(id: string, dto: UpdateContractDto, actorId?: string) {
        const before = await this.findOne(id);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: {
                ...dto,
                startDate: dto.startDate ? new Date(dto.startDate) : before.startDate,
                endDate: dto.endDate ? new Date(dto.endDate) : before.endDate
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Contract', id, {
            before,
            after: contract
        });

        return contract;
    }

    async changeStatus(id: string, status: string, actorId?: string) {
        const contract = await this.prisma.contract.update({
            where: { id },
            data: { status }
        });

        await this.audit.log(actorId ?? null, 'STATUS', 'Contract', id, { status });

        return contract;
    }

    async sign(id: string, body: { customerSignature?: string; employeeSignature?: string; signedBy?: string; fileUrl?: string }, actorId?: string) {
        const before = await this.findOne(id);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: {
                customerSignature: body.customerSignature ?? before.customerSignature,
                employeeSignature: body.employeeSignature ?? before.employeeSignature,
                signedBy: body.signedBy ?? before.signedBy,
                fileUrl: body.fileUrl ?? before.fileUrl,
                status: 'SIGNED'
            }
        });

        await this.audit.log(actorId ?? null, 'SIGN', 'Contract', id, { before, after: contract });
        return contract;
    }

    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Contract', id);
        return this.prisma.contract.delete({ where: { id } });
    }

    async attachFile(id: string, file: Express.Multer.File, actorId?: string) {
        const before = await this.findOne(id);
        if (!file) throw new BadRequestException('File is required');

        const uploaded = await this.cloudinary.uploadFile(file);

        const contract = await this.prisma.contract.update({
            where: { id },
            data: { fileUrl: uploaded.secure_url }
        });

        await this.audit.log(actorId ?? null, 'ATTACH_FILE', 'Contract', id, {
            before,
            after: contract
        });

        return contract;
    }
}

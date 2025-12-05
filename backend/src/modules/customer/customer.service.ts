import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class CustomerService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    //  LIST + SEARCH + PAGINATION
    async findAll(query: CustomerQueryDto) {
        const page = query.page ? Number(query.page) : 1;
        const limit = query.limit ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { phone: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.customer.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.customer.count({ where })
        ]);

        return {
            items,
            page,
            total,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    //  FIND ONE
    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                bookings: true,
                reviews: true,
                invoices: true
            }
        });

        if (!customer) throw new NotFoundException('Customer not found');

        return customer;
    }

    //  CREATE
    async create(dto: CreateCustomerDto, actorId?: string) {
        if (dto.userId) {
            const exists = await this.prisma.customer.findUnique({
                where: { userId: dto.userId }
            });
            if (exists) throw new BadRequestException('User already linked to another customer');
        }

        const customer = await this.prisma.customer.create({
            data: {
                ...dto,
                driverLicenseExpiry: dto.driverLicenseExpiry ? new Date(dto.driverLicenseExpiry) : undefined
            }
        });

        await this.audit.log(actorId, 'CREATE', 'Customer', customer.id, customer);

        return customer;
    }

    //  UPDATE
    async update(id: string, dto: UpdateCustomerDto, actorId?: string) {
        const before = await this.findOne(id);

        const updateData: any = {
            ...dto,
            driverLicenseExpiry: dto.driverLicenseExpiry ? new Date(dto.driverLicenseExpiry) : undefined,
            dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined
        };

        // not allow update userId via DTO
        delete updateData.userId;

        const updated = await this.prisma.customer.update({
            where: { id },
            data: updateData
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Customer', id, {
            before,
            after: updated
        });

        return updated;
    }

    //  UPDATE LOYALTY POINTS + TIER
    async updateLoyalty(id: string, points: number, actorId?: string) {
        const customer = await this.findOne(id);

        const newPoints = customer.loyaltyPoints + points;

        // basic tier logic — can be upgraded later
        let newTier = 'BASIC';
        if (newPoints > 50000000) newTier = 'VIP';
        else if (newPoints > 20000000) newTier = 'GOLD';
        else if (newPoints > 5000000) newTier = 'SILVER';

        const updated = await this.prisma.customer.update({
            where: { id },
            data: {
                loyaltyPoints: newPoints,
                membershipTier: newTier
            }
        });

        await this.audit.log(actorId ?? null, 'LOYALTY_UPDATE', 'Customer', id, updated);

        return updated;
    }

    //  DELETE
    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Customer', id);

        // Cascade delete is not strong, only delete customer record
        return this.prisma.customer.delete({ where: { id } });
    }

    async getByUserId(userId: string) {
        return this.prisma.customer.findUnique({ where: { userId } });
    }
}

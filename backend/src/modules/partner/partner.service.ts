import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { PartnerQueryDto } from './dto/partner-query.dto';

@Injectable()
export class PartnerService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    private async ensureUniqueCode(code: string, ignoreId?: string) {
        const normalized = code.toUpperCase();
        const existing = await this.prisma.partner.findUnique({ where: { code: normalized } });
        if (existing && existing.id !== ignoreId) {
            throw new BadRequestException('Partner code already exists');
        }
    }

    async findAll(query: PartnerQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { code: { contains: query.search, mode: 'insensitive' } },
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.status) where.status = query.status;
        if (query.code) {
            where.code = query.code.trim().toUpperCase();
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.partner.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.partner.count({ where })
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
        const item = await this.prisma.partner.findUnique({
            where: { id }
        });

        if (!item) {
            throw new NotFoundException('Partner not found');
        }

        return item;
    }

    async findByCode(code: string) {
        const item = await this.prisma.partner.findUnique({
            where: { code: code.toUpperCase() }
        });

        if (!item) {
            throw new NotFoundException('Partner not found');
        }

        return item;
    }

    async create(dto: CreatePartnerDto, userId?: string) {
        await this.ensureUniqueCode(dto.code);

        const item = await this.prisma.partner.create({
            data: {
                name: dto.name,
                code: dto.code.toUpperCase(),
                phone: dto.phone,
                email: dto.email,
                note: dto.note,
                status: dto.status || 'ACTIVE'
            }
        });

        if (userId) {
            await this.audit.log(userId, 'CREATE', 'Partner', item.id, { code: item.code });
        }

        return item;
    }

    async update(id: string, dto: UpdatePartnerDto, userId?: string) {
        await this.findOne(id);

        if (dto.code) {
            await this.ensureUniqueCode(dto.code, id);
        }

        const item = await this.prisma.partner.update({
            where: { id },
            data: {
                ...(dto.name && { name: dto.name }),
                ...(dto.code && { code: dto.code.toUpperCase() }),
                ...(dto.phone !== undefined && { phone: dto.phone }),
                ...(dto.email !== undefined && { email: dto.email }),
                ...(dto.note !== undefined && { note: dto.note }),
                ...(dto.status && { status: dto.status })
            }
        });

        if (userId) {
            await this.audit.log(userId, 'UPDATE', 'Partner', item.id, { code: item.code });
        }

        return item;
    }

    async delete(id: string, userId?: string) {
        await this.findOne(id);

        await this.prisma.partner.delete({
            where: { id }
        });

        if (userId) {
            await this.audit.log(userId, 'DELETE', 'Partner', id);
        }

        return { success: true };
    }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PriceListQueryDto } from './dto/price-list-query.dto';
import { CreatePriceListDto } from './dto/create-pricelist.dto';
import { UpdatePriceListDto } from './dto/update-pricelist.dto';

@Injectable()
export class PriceListService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: PriceListQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.priceList.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.priceList.count({ where })
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
        const priceList = await this.prisma.priceList.findUnique({
            where: { id },
            include: { vehicles: true }
        });
        if (!priceList) throw new NotFoundException('Price list not found');
        return priceList;
    }

    async create(dto: CreatePriceListDto, actorId?: string) {
        const priceList = await this.prisma.priceList.create({
            data: {
                name: dto.name,
                description: dto.description,
                currency: dto.currency ?? 'VND',
                dailyRate: dto.dailyRate,
                hourlyRate: dto.hourlyRate,
                weekendRate: dto.weekendRate,
                holidayRate: dto.holidayRate,
                isActive: dto.isActive ?? true
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'PriceList', priceList.id, priceList);

        return priceList;
    }

    async update(id: string, dto: UpdatePriceListDto, actorId?: string) {
        const before = await this.findOne(id);

        const priceList = await this.prisma.priceList.update({
            where: { id },
            data: dto
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'PriceList', id, {
            before,
            after: priceList
        });

        return priceList;
    }

    async deactivate(id: string, actorId?: string) {
        const priceList = await this.prisma.priceList.update({
            where: { id },
            data: { isActive: false }
        });

        await this.audit.log(actorId ?? null, 'DEACTIVATE', 'PriceList', id, priceList);

        return priceList;
    }

    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'PriceList', id);
        return this.prisma.priceList.delete({ where: { id } });
    }
}

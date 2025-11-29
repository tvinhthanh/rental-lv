import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVehicleCategoryDto } from './dto/create-vehicle-category.dto';
import { UpdateVehicleCategoryDto } from './dto/update-vehicle-category.dto';
import { VehicleCategoryQueryDto } from './dto/vehicle-category-query.dto';

@Injectable()
export class VehicleCategoryService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: VehicleCategoryQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { displayOrder: 'asc' }
            }),
            this.prisma.vehicleCategory.count({ where })
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
        const category = await this.prisma.vehicleCategory.findUnique({
            where: { id },
            include: { vehicles: true }
        });
        if (!category) throw new NotFoundException('Vehicle category not found');
        return category;
    }

    async create(dto: CreateVehicleCategoryDto, actorId?: string) {
        if (dto.code) {
            const exists = await this.prisma.vehicleCategory.findUnique({ where: { code: dto.code } });
            if (exists) throw new BadRequestException('Category code already exists');
        }

        const category = await this.prisma.vehicleCategory.create({
            data: {
                name: dto.name,
                code: dto.code || null,
                slug: dto.slug || null,
                description: dto.description || null,
                imageUrl: dto.imageUrl || null,
                metaTitle: dto.metaTitle || null,
                metaDescription: dto.metaDescription || null,
                displayOrder: dto.displayOrder ?? 0
            }
        });


        await this.audit.log(actorId ?? null, 'CREATE', 'VehicleCategory', category.id, category);

        return category;
    }

    async update(id: string, dto: UpdateVehicleCategoryDto, actorId?: string) {
        const before = await this.findOne(id);

        // Check duplicate code
        if (dto.code && dto.code !== before.code) {
            const exists = await this.prisma.vehicleCategory.findUnique({ where: { code: dto.code } });
            if (exists) throw new BadRequestException('Category code already exists');
        }

        // CHỈ PICK FIELD NÀO CHO UPDATE
        const data: any = {
            name: dto.name,
            code: dto.code,
            slug: dto.slug,
            description: dto.description,
            imageUrl: dto.imageUrl,
            metaTitle: dto.metaTitle,
            metaDescription: dto.metaDescription,
            seoTitle: dto.seoTitle,
            hTitle: dto.hTitle,
            displayOrder: dto.displayOrder,
            isActive: dto.isActive
        };

        const category = await this.prisma.vehicleCategory.update({
            where: { id },
            data
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'VehicleCategory', id, {
            before,
            after: category
        });

        return category;
    }


    async delete(id: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'VehicleCategory', id);
        return this.prisma.vehicleCategory.delete({ where: { id } });
    }
}

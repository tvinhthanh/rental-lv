import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateVehicleBrandDto } from './dto/create-vehicle-brand.dto';
import { UpdateVehicleBrandDto } from './dto/update-vehicle-brand.dto';
import { VehicleBrandQueryDto } from './dto/vehicle-brand-query.dto';

@Injectable()
export class VehicleBrandService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: VehicleBrandQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { country: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleBrand.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.vehicleBrand.count({ where })
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
        const item = await this.prisma.vehicleBrand.findUnique({
            where: { id }
        });

        if (!item) {
            throw new NotFoundException('Brand not found');
        }

        return item;
    }

    async create(dto: CreateVehicleBrandDto, actorId?: string) {
        const slug = dto.slug || this.generateSlug(dto.name);

        const exists = await this.prisma.vehicleBrand.findUnique({ where: { slug } });
        if (exists) throw new BadRequestException("Slug already exists");

        const brand = await this.prisma.vehicleBrand.create({
            data: {
                name: dto.name,
                slug,
                country: dto.country,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl || dto.website,
                description: dto.description,

                displayOrder: dto.sortOrder,
                isFeatured: dto.isFeatured,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,

                status: dto.isActive ?? true
            }
        });

        await this.audit.log(actorId, "CREATE", "VehicleBrand", brand.id, brand);

        return brand;
    }

    async update(id: string, dto: UpdateVehicleBrandDto, actorId?: string) {
        const brandOld = await this.prisma.vehicleBrand.findUnique({ where: { id } });
        if (!brandOld) throw new NotFoundException("Brand not found");

        // Generate new slug only if:
        // 1. FE gửi slug
        // 2. Hoặc FE đổi name
        let slug = dto.slug;

        if (!slug && dto.name) {
            slug = this.generateSlug(dto.name);
        }

        // If slug changed => check duplicate
        if (slug && slug !== brandOld.slug) {
            const exists = await this.prisma.vehicleBrand.findUnique({
                where: { slug }
            });
            if (exists) throw new BadRequestException("Slug already exists");
        }

        const brand = await this.prisma.vehicleBrand.update({
            where: { id },
            data: {
                name: dto.name,
                slug,

                country: dto.country,
                logoUrl: dto.logoUrl,
                websiteUrl: dto.websiteUrl || dto.website,

                description: dto.description,

                displayOrder: dto.sortOrder,  // undefined → ignored, ok
                isFeatured: dto.isFeatured,  // undefined → ignored
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription,

                status: dto.isActive
            }
        });

        await this.audit.log(actorId, "UPDATE", "VehicleBrand", id, brand);

        return brand;
    }



    async delete(id: string, actorId?: string) {
        const brand = await this.findOne(id);

        await this.audit.log(actorId ?? null, 'DELETE', 'VehicleBrand', id, brand);

        return this.prisma.vehicleBrand.delete({ where: { id } });
    }

    private generateSlug(name: string) {
        return name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
    }
}

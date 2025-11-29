import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { BranchQueryDto } from './dto/branch-query.dto';
import { slugify } from "@/utils/slugify";

@Injectable()
export class BranchService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    async findAll(query: BranchQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { code: { contains: query.search, mode: 'insensitive' } },
                { city: { contains: query.search, mode: 'insensitive' } },
                { country: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive === 'true';
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.branch.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.branch.count({ where })
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
        const branch = await this.prisma.branch.findUnique({
            where: { id },
            include: {
                vehicles: true,
                employees: true,
                bookings: true
            }
        });
        if (!branch) throw new NotFoundException('Branch not found');
        return branch;
    }


    async create(dto: CreateBranchDto, actorId?: string) {
        // 1. Auto slug nếu không gửi
        const slug = dto.slug ?? slugify(dto.name);

        // 2. Auto code HCM01, HCM02...
        let code = dto.code;
        if (!code) {
            const prefix = slug.substring(0, 3).toUpperCase(); // HCM, DAN, HAN
            const count = await this.prisma.branch.count({
                where: { slug: { startsWith: slug.substring(0, 3) } }
            });
            code = `${prefix}${String(count + 1).padStart(2, "0")}`;
        }

        // 3. Check trùng code hoặc slug
        const existedSlug = await this.prisma.branch.findUnique({ where: { slug } });
        if (existedSlug) throw new BadRequestException("Slug already exists");

        const existedCode = await this.prisma.branch.findUnique({ where: { code } });
        if (existedCode) throw new BadRequestException("Branch code already exists");

        const branch = await this.prisma.branch.create({
            data: {
                ...dto,
                slug,
                code
            }
        });

        await this.audit.log(actorId ?? null, "CREATE", "Branch", branch.id, branch);
        return branch;
    }


    async update(branchId: string, dto: UpdateBranchDto, actorId?: string) {
        const before = await this.findOne(branchId);

        const { branchId: _, createdAt, updatedAt, ...dataClean } = dto;

        if (dataClean.code && dataClean.code !== before.code) {
            const exists = await this.prisma.branch.findUnique({ where: { code: dataClean.code } });
            if (exists) throw new BadRequestException('Branch code already exists');
        }

        const branch = await this.prisma.branch.update({
            where: { id: branchId },
            data: dataClean
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Branch', branchId, { before, after: branch });
        return branch;
    }

    async deactivate(branchId: string, actorId?: string) {
        const branch = await this.prisma.branch.update({
            where: { id: branchId },
            data: { isActive: false }
        });

        await this.audit.log(actorId ?? null, 'DEACTIVATE', 'Branch', branchId, branch);

        return branch;
    }

    async delete(branchId: string, actorId?: string) {
        await this.audit.log(actorId ?? null, 'DELETE', 'Branch', branchId);
        return this.prisma.branch.delete({ where: { id: branchId } });
    }
}

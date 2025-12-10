import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PageQueryDto } from './dto/page-query.dto';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PageService {
    constructor(
        private prisma: PrismaService,
        private audit: AuditLogService
    ) { }

    private slugify(value: string) {
        return value
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');
    }

    async findAll(query: PageQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
                { content: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.status) where.status = query.status;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.page.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.page.count({ where })
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
        const page = await this.prisma.page.findUnique({ where: { id } });
        if (!page) throw new NotFoundException('Page not found');
        return page;
    }

    async create(dto: CreatePageDto, actorId?: string) {
        const slug = dto.slug || this.slugify(dto.title);
        const exist = await this.prisma.page.findUnique({ where: { slug } });
        if (exist) throw new BadRequestException('Page slug already exists');

        const page = await this.prisma.page.create({
            data: {
                title: dto.title,
                slug,
                content: dto.content,
                status: dto.status || 'PUBLISHED',
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'Page', page.id, page);
        return page;
    }

    async update(id: string, dto: UpdatePageDto, actorId?: string) {
        const existing = await this.findOne(id);

        let slug = dto.slug;
        if (!slug && dto.title) slug = this.slugify(dto.title);

        if (slug && slug !== existing.slug) {
            const exist = await this.prisma.page.findUnique({ where: { slug } });
            if (exist) throw new BadRequestException('Page slug already exists');
        }

        const page = await this.prisma.page.update({
            where: { id },
            data: {
                title: dto.title,
                slug,
                content: dto.content,
                status: dto.status,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'Page', id, { before: existing, after: page });
        return page;
    }

    async delete(id: string, actorId?: string) {
        await this.findOne(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'Page', id);
        return this.prisma.page.delete({ where: { id } });
    }
}

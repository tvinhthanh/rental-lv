import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BlogCategoryQueryDto } from './dto/blog-category-query.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Injectable()
export class BlogService {
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

    // ====== CATEGORY ======
    async listCategories(query: BlogCategoryQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } }
            ];
        }

        const [items, total] = await this.prisma.$transaction([
            this.prisma.blogCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            this.prisma.blogCategory.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getCategory(id: string) {
        const category = await this.prisma.blogCategory.findUnique({
            where: { id }
        });
        if (!category) throw new NotFoundException('Category not found');
        return category;
    }

    async createCategory(dto: CreateBlogCategoryDto, actorId?: string) {
        const slug = dto.slug || this.slugify(dto.name);

        const exist = await this.prisma.blogCategory.findUnique({ where: { slug } });
        if (exist) throw new BadRequestException('Category slug already exists');

        const category = await this.prisma.blogCategory.create({
            data: {
                name: dto.name,
                slug,
                description: dto.description
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'BlogCategory', category.id, category);
        return category;
    }

    async updateCategory(id: string, dto: UpdateBlogCategoryDto, actorId?: string) {
        const existing = await this.getCategory(id);

        let slug = dto.slug;
        if (!slug && dto.name) slug = this.slugify(dto.name);

        if (slug && slug !== existing.slug) {
            const exist = await this.prisma.blogCategory.findUnique({ where: { slug } });
            if (exist) throw new BadRequestException('Category slug already exists');
        }

        const category = await this.prisma.blogCategory.update({
            where: { id },
            data: {
                name: dto.name,
                slug,
                description: dto.description
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'BlogCategory', id, { before: existing, after: category });
        return category;
    }

    async deleteCategory(id: string, actorId?: string) {
        const category = await this.getCategory(id);
        const used = await this.prisma.blogPost.count({ where: { categoryId: id } });
        if (used > 0) {
            throw new BadRequestException('Cannot delete category with posts');
        }

        await this.audit.log(actorId ?? null, 'DELETE', 'BlogCategory', id, category);
        return this.prisma.blogCategory.delete({ where: { id } });
    }

    // ====== POSTS ======
    async listPosts(query: BlogPostQueryDto) {
        const page = Number(query.page) > 0 ? Number(query.page) : 1;
        const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
                { excerpt: { contains: query.search, mode: 'insensitive' } }
            ];
        }
        if (query.status) where.status = query.status;
        if (query.categoryId) where.categoryId = query.categoryId;

        const [items, total] = await this.prisma.$transaction([
            this.prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    author: true
                }
            }),
            this.prisma.blogPost.count({ where })
        ]);

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getPost(id: string) {
        const post = await this.prisma.blogPost.findUnique({
            where: { id },
            include: {
                category: true,
                author: true
            }
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async createPost(dto: CreateBlogPostDto, actorId?: string) {
        const slug = dto.slug || this.slugify(dto.title);
        const exist = await this.prisma.blogPost.findUnique({ where: { slug } });
        if (exist) throw new BadRequestException('Post slug already exists');

        if (dto.categoryId) {
            const cat = await this.prisma.blogCategory.findUnique({ where: { id: dto.categoryId } });
            if (!cat) throw new BadRequestException('Category not found');
        }

        if (dto.authorId) {
            const author = await this.prisma.employee.findUnique({ where: { id: dto.authorId } });
            if (!author) throw new BadRequestException('Author not found');
        }

        const post = await this.prisma.blogPost.create({
            data: {
                title: dto.title,
                slug,
                content: dto.content,
                excerpt: dto.excerpt,
                thumbnailUrl: dto.thumbnailUrl,
                categoryId: dto.categoryId,
                authorId: dto.authorId,
                status: dto.status || 'DRAFT',
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription
            }
        });

        await this.audit.log(actorId ?? null, 'CREATE', 'BlogPost', post.id, post);
        return post;
    }

    async updatePost(id: string, dto: UpdateBlogPostDto, actorId?: string) {
        const existing = await this.getPost(id);

        let slug = dto.slug;
        if (!slug && dto.title) slug = this.slugify(dto.title);

        if (slug && slug !== existing.slug) {
            const existSlug = await this.prisma.blogPost.findUnique({ where: { slug } });
            if (existSlug) throw new BadRequestException('Post slug already exists');
        }

        if (dto.categoryId) {
            const cat = await this.prisma.blogCategory.findUnique({ where: { id: dto.categoryId } });
            if (!cat) throw new BadRequestException('Category not found');
        }

        if (dto.authorId) {
            const author = await this.prisma.employee.findUnique({ where: { id: dto.authorId } });
            if (!author) throw new BadRequestException('Author not found');
        }

        const post = await this.prisma.blogPost.update({
            where: { id },
            data: {
                title: dto.title,
                slug,
                content: dto.content,
                excerpt: dto.excerpt,
                thumbnailUrl: dto.thumbnailUrl,
                categoryId: dto.categoryId,
                authorId: dto.authorId,
                status: dto.status,
                metaTitle: dto.metaTitle,
                metaDescription: dto.metaDescription
            }
        });

        await this.audit.log(actorId ?? null, 'UPDATE', 'BlogPost', id, { before: existing, after: post });
        return post;
    }

    async deletePost(id: string, actorId?: string) {
        await this.getPost(id);
        await this.audit.log(actorId ?? null, 'DELETE', 'BlogPost', id);
        return this.prisma.blogPost.delete({ where: { id } });
    }
}

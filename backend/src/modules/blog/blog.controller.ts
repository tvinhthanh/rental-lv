import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogCategoryQueryDto } from './dto/blog-category-query.dto';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { BlogPostQueryDto } from './dto/blog-post-query.dto';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

@Controller('blog')
export class BlogController {
    constructor(private service: BlogService) { }

    // ====== CATEGORIES ======
    @Get('categories')
    listCategories(@Query() query: BlogCategoryQueryDto) {
        return this.service.listCategories(query);
    }

    @Get('categories/:id')
    categoryDetail(@Param('id') id: string) {
        return this.service.getCategory(id);
    }

    @Post('categories')
    createCategory(@Body() dto: CreateBlogCategoryDto) {
        return this.service.createCategory(dto);
    }

    @Put('categories/:id')
    updateCategory(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) {
        return this.service.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.service.deleteCategory(id);
    }

    // ====== POSTS ======
    @Get('posts')
    listPosts(@Query() query: BlogPostQueryDto) {
        return this.service.listPosts(query);
    }

    @Get('posts/:id')
    postDetail(@Param('id') id: string) {
        return this.service.getPost(id);
    }

    @Post('posts')
    createPost(@Body() dto: CreateBlogPostDto) {
        return this.service.createPost(dto);
    }

    @Put('posts/:id')
    updatePost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
        return this.service.updatePost(id, dto);
    }

    @Delete('posts/:id')
    deletePost(@Param('id') id: string) {
        return this.service.deletePost(id);
    }
}

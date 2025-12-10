import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogPostDto {
    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsNotEmpty()
    @IsString()
    content!: string;

    @IsOptional()
    @IsString()
    excerpt?: string;

    @IsOptional()
    @IsString()
    thumbnailUrl?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    authorId?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;
}

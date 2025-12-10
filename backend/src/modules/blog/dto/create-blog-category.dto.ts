import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBlogCategoryDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

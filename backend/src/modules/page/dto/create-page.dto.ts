import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePageDto {
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
    status?: string;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;
}

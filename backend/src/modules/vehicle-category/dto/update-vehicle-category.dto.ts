import { IsOptional, IsString, IsInt, IsBoolean } from 'class-validator';

export class UpdateVehicleCategoryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsString()
    seoTitle?: string;

    @IsOptional()
    @IsString()
    hTitle?: string;

    @IsOptional()
    @IsInt()
    displayOrder?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    slug!: string;
}

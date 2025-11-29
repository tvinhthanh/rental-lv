import { IsOptional, IsString, IsBoolean, IsNumber } from "class-validator";

export class UpdateVehicleBrandDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    logoUrl?: string;

    @IsOptional()
    @IsString()
    website?: string;

    @IsOptional()
    @IsString()
    websiteUrl?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    sortOrder?: number;

    @IsOptional()
    @IsBoolean()
    isFeatured?: boolean;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

import { IsOptional, IsString, IsBoolean, IsNumber } from "class-validator";

export class CreateVehicleBrandDto {
    @IsString()
    name!: string;

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
    website?: string; // FE gửi website

    @IsOptional()
    @IsString()
    websiteUrl?: string; // backend sẽ map từ "website"

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

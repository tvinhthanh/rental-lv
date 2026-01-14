import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class UpdateVehicleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, { message: 'licensePlate must follow format 30A-12345' })
    licensePlate?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(new Date().getFullYear() + 1)
    year?: number;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(50)
    seatCount?: number;

    @IsOptional()
    @IsString()
    transmission?: string;

    @IsOptional()
    @IsString()
    fuelType?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    mileage?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase and use hyphens' })
    slug?: string;

    @IsOptional()
    @IsString()
    metaTitle?: string;

    @IsOptional()
    @IsString()
    metaDescription?: string;

    @IsOptional()
    @IsString()
    seoDescription?: string;

    @IsOptional()
    @IsArray()
    photos?: string[];

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsString()
    priceListId?: string;

    @IsOptional()
    @IsBoolean()
    overridePriceEnabled?: boolean;

    @IsOptional()
    @IsNumber()
    @Min(0)
    overrideDailyRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    overrideHourlyRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    overrideWeekendRate?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    overrideHolidayRate?: number;

    @IsOptional()
    @IsString()
    brandId?: string;
}

import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsOptional()
    @IsString()
    licensePlate?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsString()
    model?: string;

    @IsOptional()
    @IsInt()
    year?: number;

    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsInt()
    seatCount?: number;

    @IsOptional()
    @IsString()
    transmission?: string;

    @IsOptional()
    @IsString()
    fuelType?: string;

    @IsOptional()
    @IsInt()
    mileage?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
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
    photos?: string[];

    @IsOptional()
    categoryId?: string;

    @IsOptional()
    branchId?: string;

    @IsOptional()
    priceListId?: string;

    @IsOptional()
    overridePriceEnabled?: boolean;

    @IsOptional()
    overrideDailyRate?: number;

    @IsOptional()
    overrideHourlyRate?: number;

    @IsOptional()
    overrideWeekendRate?: number;

    @IsOptional()
    overrideHolidayRate?: number;

    @IsString()
    brandId!: string;
}

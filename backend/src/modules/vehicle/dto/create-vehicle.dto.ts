import { IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsString()
    @Matches(/^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, { message: 'licensePlate must follow format 30A-12345' })
    licensePlate!: string;

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
    status?: string; // AVAILABLE / RENTED / ...

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

    @IsString()
    categoryId!: string;

    @IsString()
    branchId!: string;

    @IsString()
    brandId!: string;

    // --- PRICE SOURCE LOGIC ------------------------------------

    @IsOptional()
    @IsString()
    priceListId?: string;

    // FE bật override hay không
    @IsOptional()
    @IsBoolean()
    overridePriceEnabled?: boolean;

    // FE chọn "Ưu tiên dùng price list" hay "dùng override price"
    @IsOptional()
    @IsBoolean()
    usePriceList?: boolean;

    // --- PRICE OVERRIDE FIELDS ---------------------------------

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
}

import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    vehicleType?: string;

    @IsString()
    licensePlate!: string;

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
    status?: string; // AVAILABLE / RENTED / ...

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
    overrideDailyRate?: number;

    @IsOptional()
    overrideHourlyRate?: number;

    @IsOptional()
    overrideWeekendRate?: number;

    @IsOptional()
    overrideHolidayRate?: number;
}

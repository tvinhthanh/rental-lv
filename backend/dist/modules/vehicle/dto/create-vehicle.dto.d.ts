export declare class CreateVehicleDto {
    name: string;
    vehicleType?: string;
    licensePlate: string;
    model?: string;
    year?: number;
    color?: string;
    seatCount?: number;
    transmission?: string;
    fuelType?: string;
    mileage?: number;
    status?: string;
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    seoDescription?: string;
    photos?: string[];
    categoryId: string;
    branchId: string;
    brandId: string;
    priceListId?: string;
    overridePriceEnabled?: boolean;
    usePriceList?: boolean;
    overrideDailyRate?: number;
    overrideHourlyRate?: number;
    overrideWeekendRate?: number;
    overrideHolidayRate?: number;
}

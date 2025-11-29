export declare class CreatePriceListDto {
    name: string;
    description?: string;
    currency?: string;
    dailyRate: number;
    hourlyRate?: number;
    weekendRate?: number;
    holidayRate?: number;
    isActive?: boolean;
}

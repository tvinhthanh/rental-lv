import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdatePriceListDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    dailyRate?: number;

    @IsOptional()
    @IsNumber()
    hourlyRate?: number;

    @IsOptional()
    @IsNumber()
    weekendRate?: number;

    @IsOptional()
    @IsNumber()
    holidayRate?: number;

    @IsOptional()
    isActive?: boolean;
}

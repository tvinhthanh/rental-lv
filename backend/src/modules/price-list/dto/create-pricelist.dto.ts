import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePriceListDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    currency?: string; // default VND

    @IsNotEmpty()
    @IsNumber()
    dailyRate!: number;

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

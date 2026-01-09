import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePricingRuleDto {
    @IsNotEmpty()
    @IsString()
    categoryId!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    type!: string; // weekend, holiday, seasonal

    @IsOptional()
    @IsNumber()
    @Min(0)
    percent?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    amount?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;
}


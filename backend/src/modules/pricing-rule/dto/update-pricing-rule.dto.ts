import { IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class UpdatePricingRuleDto {
    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    type?: string;

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


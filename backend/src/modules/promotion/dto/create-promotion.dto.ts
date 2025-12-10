import { IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateIf } from 'class-validator';

export class CreatePromotionDto {
    @IsNotEmpty()
    @IsString()
    code!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @ValidateIf(o => o.discountAmount == null)
    @IsNumber()
    @Min(0)
    @Max(100)
    discountPercent?: number;

    @ValidateIf(o => o.discountPercent == null)
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @IsOptional()
    @IsInt()
    @Min(1)
    usageLimit?: number;

    @IsOptional()
    @IsDateString()
    startDate?: string;

    @IsOptional()
    @IsDateString()
    endDate?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

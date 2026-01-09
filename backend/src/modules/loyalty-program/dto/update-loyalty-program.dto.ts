import { IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';

export class UpdateLoyaltyProgramDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    minAmount?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    pointsPer100k?: number;

    @IsOptional()
    @IsString()
    description?: string;
}


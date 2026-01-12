import { IsNotEmpty, IsOptional, IsString, IsNumber, IsInt, Min } from 'class-validator';

export class CreateLoyaltyProgramDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

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


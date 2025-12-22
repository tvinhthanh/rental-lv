import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, IsArray } from 'class-validator';

export class CreateReviewDto {
    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsNotEmpty()
    @IsString()
    customerId!: string;

    @IsNotEmpty()
    @IsString()
    vehicleId!: string;

    @IsNotEmpty()
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    photos?: string[];
}


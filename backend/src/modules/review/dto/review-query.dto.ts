import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ReviewQueryDto {
    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    vehicleId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}

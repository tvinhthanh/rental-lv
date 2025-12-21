import { IsInt, IsOptional, IsString } from 'class-validator';

export class ReviewQueryDto {
    @IsOptional()
    @IsString()
    vehicleId?: string;

    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsInt()
    minRating?: number;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}


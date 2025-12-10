import { IsDateString, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class UpdateBookingDto {
    @IsOptional()
    @IsString()
    returnBranchId?: string;

    @IsOptional()
    @IsDateString()
    pickupDate?: string;

    @IsOptional()
    @IsDateString()
    returnDate?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    cancelReason?: string;

    @IsOptional()
    @IsString()
    status?: string;
}

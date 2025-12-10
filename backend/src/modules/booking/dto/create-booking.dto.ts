import { IsDateString, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateBookingDto {
    @IsNotEmpty()
    @IsString()
    customerId!: string;

    @IsNotEmpty()
    @IsString()
    vehicleId!: string;

    @IsNotEmpty()
    @IsString()
    branchId!: string;

    @IsOptional()
    @IsString()
    returnBranchId?: string;

    @IsNotEmpty()
    @IsDateString()
    pickupDate!: string;

    @IsNotEmpty()
    @IsDateString()
    returnDate!: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    discountAmount?: number;

    @IsOptional()
    @IsString()
    promotionId?: string;

    @IsOptional()
    @IsString()
    note?: string;
}

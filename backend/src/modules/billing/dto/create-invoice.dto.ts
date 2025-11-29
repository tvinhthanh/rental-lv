import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateInvoiceDto {
    @IsString()
    bookingId!: string;

    @IsString()
    customerId!: string;

    @IsNumber()
    baseAmount!: number;

    @IsOptional()
    @IsNumber()
    surchargeTotal?: number;

    @IsOptional()
    @IsNumber()
    discountTotal?: number;

    @IsOptional()
    @IsNumber()
    depositApplied?: number;

    @IsOptional()
    @IsNumber()
    totalAmount?: number;
}

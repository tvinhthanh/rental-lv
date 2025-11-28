import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepositDto {
    @IsString()
    bookingId!: string;

    @IsString()
    customerId!: string;

    @IsNumber()
    totalAmount!: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

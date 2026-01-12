import { IsInt, IsOptional, IsString } from 'class-validator';

export class LoyaltyTransactionQueryDto {
    @IsOptional()
    @IsString()
    customerId?: string;

    @IsOptional()
    @IsString()
    programId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsOptional()
    @IsString()
    type?: string;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}


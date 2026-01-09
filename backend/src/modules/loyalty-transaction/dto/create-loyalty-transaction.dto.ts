import { IsNotEmpty, IsOptional, IsString, IsInt, Min } from 'class-validator';

export class CreateLoyaltyTransactionDto {
    @IsNotEmpty()
    @IsString()
    customerId!: string;

    @IsOptional()
    @IsString()
    programId?: string;

    @IsOptional()
    @IsString()
    bookingId?: string;

    @IsNotEmpty()
    @IsString()
    type!: string; // earn, redeem

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    points!: number;

    @IsOptional()
    @IsString()
    note?: string;
}


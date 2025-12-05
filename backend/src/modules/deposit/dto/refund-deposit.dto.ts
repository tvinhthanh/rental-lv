import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RefundDepositDto {
    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    note?: string;
}

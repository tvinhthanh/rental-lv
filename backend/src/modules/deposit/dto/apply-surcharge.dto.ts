import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ApplySurchargeDto {
    @IsString()
    surchargeId!: string;

    @IsNumber()
    amount!: number;

    @IsOptional()
    @IsString()
    note?: string;
}

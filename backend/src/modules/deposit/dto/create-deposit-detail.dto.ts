import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDepositDetailDto {
    @IsString()
    depositId!: string;

    @IsString()
    itemType!: string;

    @IsOptional()
    @IsString()
    itemName?: string;

    @IsOptional()
    @IsString()
    identifier?: string;

    @IsOptional()
    @IsNumber()
    amount?: number;

    @IsOptional()
    @IsString()
    condition?: string;

    @IsOptional()
    @IsArray()
    photoUrls?: string[];

    @IsOptional()
    @IsString()
    notes?: string;
}

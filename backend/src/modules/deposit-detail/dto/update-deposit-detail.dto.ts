import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDepositDetailDto {
    @IsOptional()
    @IsString()
    itemType?: string;

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
    @IsString({ each: true })
    photoUrls?: string[];

    @IsOptional()
    @IsString()
    notes?: string;
}


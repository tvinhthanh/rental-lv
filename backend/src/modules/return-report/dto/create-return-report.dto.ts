import { IsArray, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReturnReportDto {
    @IsString()
    bookingId!: string;

    @IsOptional()
    @IsInt()
    odoEnd?: number;

    @IsOptional()
    @IsInt()
    fuelLevelEnd?: number;

    @IsOptional()
    @IsString()
    damageNote?: string;

    @IsOptional()
    @IsNumber()
    extraCharge?: number;

    @IsOptional()
    @IsString()
    condition?: string;

    @IsOptional()
    @IsString()
    checklist?: string;

    @IsOptional()
    @IsString()
    returnBranchId?: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsArray()
    photoUrls?: string[];

    // Surcharge helpers
    @IsOptional()
    @IsNumber()
    fuelSurchargeAmount?: number;

    @IsOptional()
    @IsNumber()
    overKmSurchargeAmount?: number;

    @IsOptional()
    @IsNumber()
    damageSurchargeAmount?: number;
}

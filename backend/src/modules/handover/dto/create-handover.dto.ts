import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateHandoverDto {
    @IsString()
    bookingId!: string;

    @IsOptional()
    @IsInt()
    odoStart?: number;

    @IsOptional()
    @IsInt()
    fuelLevelStart?: number;

    @IsOptional()
    @IsString()
    pickupPlace?: string;

    @IsOptional()
    @IsString()
    exteriorStatus?: string;

    @IsOptional()
    @IsString()
    interiorStatus?: string;

    @IsOptional()
    @IsString()
    damageNote?: string;

    @IsOptional()
    @IsString()
    accessories?: string;

    @IsOptional()
    @IsString()
    customerSignature?: string;

    @IsOptional()
    @IsString()
    handedOverBy?: string;

    @IsOptional()
    @IsArray()
    photoUrls?: string[];
}

import { IsOptional, IsString } from 'class-validator';

export class CreateBranchDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsString()
    slug!: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    latitude?: number;

    @IsOptional()
    longitude?: number;

    @IsOptional()
    @IsString()
    googleMapUrl?: string;

    @IsOptional()
    @IsString()
    businessHours?: string;

    @IsOptional()
    isActive?: boolean;
}

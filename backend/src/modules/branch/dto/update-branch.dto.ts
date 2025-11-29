import { IsOptional, IsString } from 'class-validator';

export class UpdateBranchDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsString()
    address?: string;

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

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    createdAt?: Date;

    updatedAt?: Date;
}

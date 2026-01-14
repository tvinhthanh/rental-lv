import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateBranchDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Z0-9-]+$/, { message: 'code must be uppercase alphanumeric' })
    code?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsString()
    @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase and use hyphens' })
    slug!: string;

    @IsOptional()
    @IsString()
    city?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsOptional()
    @IsString()
    @Matches(/^0\d{9}$/, { message: 'phone must be 10 digits starting with 0' })
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude?: number;

    @IsOptional()
    @IsString()
    googleMapUrl?: string;

    @IsOptional()
    @IsString()
    businessHours?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

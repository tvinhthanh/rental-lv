import { IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateCustomerDto {
    @IsOptional()
    @IsString()
    fullName?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    driverLicenseNo?: string;

    @IsOptional()
    @IsDateString()
    driverLicenseExpiry?: string;

    @IsOptional()
    @IsString()
    nationalId?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    avatarUrl?: string;

    @IsOptional()
    userId?: string;
}

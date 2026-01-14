import { IsEmail, IsNotEmpty, IsOptional, IsString, IsDateString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateCustomerDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^0\d{9}$/, { message: 'phone must be 10 digits starting with 0' })
    phone!: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[A-Za-z0-9]{6,20}$/, { message: 'driverLicenseNo must be 6-20 alphanumeric characters' })
    driverLicenseNo?: string;

    @IsOptional()
    @IsDateString()
    driverLicenseExpiry?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(?:\d{9}|\d{12})$/, { message: 'nationalId must be 9 or 12 digits' })
    nationalId?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    // nếu muốn link sẵn với User
    @IsOptional()
    userId?: string;
}

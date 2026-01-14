import { IsNotEmpty, IsOptional, IsString, IsEmail, IsDateString, IsNumber, Matches, MaxLength, Min, MinLength } from 'class-validator';

export class CreateEmployeeDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(100)
    fullName!: string;

    @IsOptional()
    @IsString()
    @Matches(/^0\d{9}$/, { message: 'phone must be 10 digits starting with 0' })
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    @Matches(/^(?:\d{9}|\d{12})$/, { message: 'nationalId must be 9 or 12 digits' })
    nationalId?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    salary?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    hireDate?: string;

    @IsOptional()
    userId?: string;

    @IsOptional()
    branchId?: string;

    @IsOptional()
    avatarUrl?: string;
}

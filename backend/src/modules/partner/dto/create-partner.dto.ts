import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePartnerDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    code!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    note?: string;

    @IsOptional()
    @IsString()
    status?: string;
}


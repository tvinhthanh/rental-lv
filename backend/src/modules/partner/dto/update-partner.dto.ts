import { IsOptional, IsString } from 'class-validator';

export class UpdatePartnerDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    code?: string;

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


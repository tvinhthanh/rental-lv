import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateCustomerSegmentDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsObject()
    conditions?: any;

    @IsOptional()
    @IsString()
    description?: string;
}


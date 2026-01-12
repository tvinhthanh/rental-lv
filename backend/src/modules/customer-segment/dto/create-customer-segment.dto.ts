import { IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateCustomerSegmentDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsObject()
    conditions!: any; // JSON object

    @IsOptional()
    @IsString()
    description?: string;
}


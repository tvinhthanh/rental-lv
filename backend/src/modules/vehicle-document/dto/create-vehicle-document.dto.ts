import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateVehicleDocumentDto {
    @IsNotEmpty()
    @IsString()
    vehicleId!: string;

    @IsNotEmpty()
    @IsString()
    docType!: string;

    @IsOptional()
    @IsString()
    documentName?: string;

    @IsOptional()
    @IsString()
    number?: string;

    @IsOptional()
    @IsString()
    fileUrl?: string;

    @IsOptional()
    @IsDateString()
    issuedAt?: string;

    @IsOptional()
    @IsDateString()
    expiresAt?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}


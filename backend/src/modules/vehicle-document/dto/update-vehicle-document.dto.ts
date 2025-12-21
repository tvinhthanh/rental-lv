import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateVehicleDocumentDto {
    @IsOptional()
    @IsString()
    docType?: string;

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


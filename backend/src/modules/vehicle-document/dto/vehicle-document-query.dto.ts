import { IsInt, IsOptional, IsString } from 'class-validator';

export class VehicleDocumentQueryDto {
    @IsOptional()
    @IsString()
    vehicleId?: string;

    @IsOptional()
    @IsString()
    docType?: string;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}


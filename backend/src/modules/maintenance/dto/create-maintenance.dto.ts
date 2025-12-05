import { IsDateString, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateMaintenanceDto {
    @IsString()
    vehicleId!: string;

    @IsString()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsDateString()
    maintenanceDate!: string;

    @IsOptional()
    @IsInt()
    odometer?: number;

    @IsOptional()
    @IsString()
    performedBy?: string;

    @IsOptional()
    @IsNumber()
    cost?: number;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    nextMaintenanceAt?: string;
}

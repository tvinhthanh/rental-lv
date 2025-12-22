import { IsBooleanString, IsNumberString, IsOptional, IsString } from 'class-validator';

export class VehicleQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    branchId?: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;

    @IsOptional()
    @IsBooleanString()
    skipDocumentCheck?: string; // Admin có thể bypass filter giấy tờ
}

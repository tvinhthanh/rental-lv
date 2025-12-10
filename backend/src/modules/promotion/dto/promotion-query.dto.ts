import { IsBooleanString, IsInt, IsOptional, IsString } from 'class-validator';

export class PromotionQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    code?: string;

    @IsOptional()
    @IsBooleanString()
    active?: string;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}

import { IsInt, IsOptional, IsString } from 'class-validator';

export class DepositDetailQueryDto {
    @IsOptional()
    @IsString()
    depositId?: string;

    @IsOptional()
    @IsString()
    itemType?: string;

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}


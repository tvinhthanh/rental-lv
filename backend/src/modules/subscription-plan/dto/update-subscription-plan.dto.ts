import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class UpdateSubscriptionPlanDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsNumber()
    @IsOptional()
    price?: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[];

    @IsNumber()
    @IsOptional()
    duration?: number;

    @IsString()
    @IsOptional()
    description?: string;
}

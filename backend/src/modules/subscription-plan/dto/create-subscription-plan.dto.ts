import { IsString, IsNumber, IsArray, IsOptional } from 'class-validator';

export class CreateSubscriptionPlanDto {
    @IsString()
    name!: string;

    @IsNumber()
    price!: number;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    features?: string[];

    @IsNumber()
    duration!: number; // days

    @IsString()
    @IsOptional()
    description?: string;
}

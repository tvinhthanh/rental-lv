import { IsInt, IsOptional, IsString, Max, Min, IsArray } from 'class-validator';

export class UpdateReviewDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    comment?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    photos?: string[];
}


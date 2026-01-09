import { IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateMarketingCampaignDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    segmentId?: string;

    @IsOptional()
    @IsString()
    templateId?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    scheduledAt?: string;
}


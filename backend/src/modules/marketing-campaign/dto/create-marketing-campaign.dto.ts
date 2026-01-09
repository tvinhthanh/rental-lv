import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateMarketingCampaignDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    segmentId!: string;

    @IsNotEmpty()
    @IsString()
    templateId!: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    scheduledAt?: string;
}


import { IsOptional, IsString, IsNumber, IsBoolean, IsUrl } from 'class-validator';

export class CreateSettingsDto {
    @IsOptional()
    @IsString()
    googleMapsApiKey?: string;

    @IsOptional()
    @IsString()
    cloudinaryApiKey?: string;

    @IsOptional()
    @IsString()
    cloudinaryCloudName?: string;

    @IsOptional()
    @IsString()
    cloudinaryUploadPreset?: string;

    @IsOptional()
    @IsNumber()
    itemsPerPage?: number;

    @IsOptional()
    @IsBoolean()
    showIcons?: boolean;

    @IsOptional()
    @IsString()
    defaultLanguage?: string;

    @IsOptional()
    @IsString()
    smtpHost?: string;

    @IsOptional()
    @IsString()
    smtpPort?: string;

    @IsOptional()
    @IsString()
    smtpUser?: string;

    @IsOptional()
    @IsString()
    smtpPassword?: string;

    @IsOptional()
    @IsString()
    smtpFromEmail?: string;

    @IsOptional()
    @IsUrl()
    facebookUrl?: string;

    @IsOptional()
    @IsUrl()
    instagramUrl?: string;

    @IsOptional()
    @IsUrl()
    youtubeUrl?: string;

    @IsOptional()
    @IsString()
    siteName?: string;

    @IsOptional()
    @IsString()
    siteDescription?: string;

    @IsOptional()
    @IsString()
    siteLogo?: string;

    @IsOptional()
    @IsString()
    favicon?: string;

    @IsOptional()
    @IsString()
    aboutContent?: string;

    @IsOptional()
    @IsString()
    termsContent?: string;

    @IsOptional()
    @IsString()
    privacyContent?: string;

    @IsOptional()
    @IsString()
    refundContent?: string;

    @IsOptional()
    @IsString()
    contactContent?: string;
}


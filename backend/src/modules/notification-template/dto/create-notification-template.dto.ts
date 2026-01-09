import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationTemplateDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    code!: string;

    @IsOptional()
    @IsString()
    subject?: string;

    @IsOptional()
    @IsString()
    content?: string;

    @IsNotEmpty()
    @IsString()
    type!: string; // email, sms, push
}


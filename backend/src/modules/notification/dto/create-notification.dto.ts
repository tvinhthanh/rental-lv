import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    userId!: string;

    @IsOptional()
    @IsString()
    templateId?: string;

    @IsNotEmpty()
    @IsString()
    title!: string;

    @IsNotEmpty()
    @IsString()
    message!: string;

    @IsOptional()
    @IsString()
    status?: string;
}


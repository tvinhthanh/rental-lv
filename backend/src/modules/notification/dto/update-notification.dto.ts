import { IsOptional, IsString } from 'class-validator';

export class UpdateNotificationDto {
    @IsOptional()
    @IsString()
    status?: string; // UNREAD, READ
}


import { IsInt, IsOptional, IsString } from 'class-validator';

export class NotificationQueryDto {
    @IsOptional()
    @IsString()
    userId?: string;

    @IsOptional()
    @IsString()
    status?: string; // UNREAD, READ

    @IsOptional()
    @IsInt()
    page?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}


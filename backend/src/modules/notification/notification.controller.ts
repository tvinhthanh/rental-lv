import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private service: NotificationService) { }

    @Get()
    list(@Query() query: NotificationQueryDto, @CurrentUser() user: any) {
        // If no userId in query, use current user's ID
        if (!query.userId) {
            query.userId = user.id;
        }
        return this.service.findAll(query);
    }

    @Get('unread-count')
    getUnreadCount(@CurrentUser() user: any) {
        return this.service.getUnreadCount(user.id);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateNotificationDto) {
        return this.service.create(dto);
    }

    @Put(':id/read')
    markAsRead(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.markAsRead(id, user.id);
    }

    @Put('mark-all-read')
    markAllAsRead(@CurrentUser() user: any) {
        return this.service.markAllAsRead(user.id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateNotificationDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}


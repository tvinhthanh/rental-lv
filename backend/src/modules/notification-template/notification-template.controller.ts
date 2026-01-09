import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { NotificationTemplateQueryDto } from './dto/notification-template-query.dto';
import { CreateNotificationTemplateDto } from './dto/create-notification-template.dto';
import { UpdateNotificationTemplateDto } from './dto/update-notification-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('notification-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationTemplateController {
    constructor(private service: NotificationTemplateService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: NotificationTemplateQueryDto) {
        return this.service.findAll(query);
    }

    @Get('code/:code')
    @Roles('ADMIN', 'EMPLOYEE')
    findByCode(@Param('code') code: string) {
        return this.service.findByCode(code);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateNotificationTemplateDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateNotificationTemplateDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}


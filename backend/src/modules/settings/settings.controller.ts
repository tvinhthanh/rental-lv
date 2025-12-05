import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingsDto } from './dto/create-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    // Public endpoint - no auth required
    @Get('public')
    async getPublicSettings() {
        return this.settingsService.getPublicSettings();
    }

    // Protected endpoints - require ADMIN
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Put()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async updateSettings(@Body() dto: CreateSettingsDto) {
        return this.settingsService.updateSettings(dto);
    }

    @Get('key/:key')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    async getSetting(@Param('key') key: string) {
        return this.settingsService.getSetting(key);
    }
}


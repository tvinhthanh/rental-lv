import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';

@Module({
    controllers: [SettingsController],
    providers: [SettingsService, PrismaService],
    exports: [SettingsService]
})
export class SettingsModule {}


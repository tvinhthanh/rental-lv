import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [JwtModule, ConfigModule],
    controllers: [NotificationController],
    providers: [NotificationService, NotificationGateway, PrismaService, AuditLogService],
    exports: [NotificationService, NotificationGateway]
})
export class NotificationModule { }


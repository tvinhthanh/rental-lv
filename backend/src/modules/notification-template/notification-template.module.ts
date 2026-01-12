import { Module } from '@nestjs/common';
import { NotificationTemplateController } from './notification-template.controller';
import { NotificationTemplateService } from './notification-template.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [NotificationTemplateController],
    providers: [NotificationTemplateService, PrismaService, AuditLogService],
    exports: [NotificationTemplateService]
})
export class NotificationTemplateModule { }


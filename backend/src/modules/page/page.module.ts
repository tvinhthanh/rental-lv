import { Module } from '@nestjs/common';
import { PageController } from './page.controller';
import { PageService } from './page.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [PageController],
    providers: [PageService, PrismaService, AuditLogService],
    exports: [PageService]
})
export class PageModule { }

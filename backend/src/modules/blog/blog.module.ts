import { Module } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [BlogController],
    providers: [BlogService, PrismaService, AuditLogService],
    exports: [BlogService]
})
export class BlogModule { }

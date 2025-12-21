import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [ReviewController],
    providers: [ReviewService, PrismaService, AuditLogService],
    exports: [ReviewService]
})
export class ReviewModule { }


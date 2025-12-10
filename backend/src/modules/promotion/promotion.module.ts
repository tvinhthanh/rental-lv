import { Module } from '@nestjs/common';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [PromotionController],
    providers: [PromotionService, PrismaService, AuditLogService],
    exports: [PromotionService]
})
export class PromotionModule { }

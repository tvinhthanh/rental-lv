import { Module } from '@nestjs/common';
import { PricingRuleController } from './pricing-rule.controller';
import { PricingRuleService } from './pricing-rule.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [PricingRuleController],
    providers: [PricingRuleService, PrismaService, AuditLogService],
    exports: [PricingRuleService]
})
export class PricingRuleModule { }


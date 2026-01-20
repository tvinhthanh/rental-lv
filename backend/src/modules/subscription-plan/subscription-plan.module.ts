import { Module } from '@nestjs/common';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { SubscriptionPlanService } from './subscription-plan.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditLogModule } from '../audit-log/audit-log.module';

@Module({
    imports: [PrismaModule, AuditLogModule],
    controllers: [SubscriptionPlanController],
    providers: [SubscriptionPlanService],
    exports: [SubscriptionPlanService]
})
export class SubscriptionPlanModule { }

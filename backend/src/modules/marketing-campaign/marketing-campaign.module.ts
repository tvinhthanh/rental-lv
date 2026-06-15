import { Module } from '@nestjs/common';
import { MarketingCampaignController } from './marketing-campaign.controller';
import { MarketingCampaignService } from './marketing-campaign.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BullModule } from '@nestjs/bull';
import { EmailModule } from '../email/email.module';
import { MarketingCampaignProcessor } from './marketing-campaign.processor';

@Module({
    imports: [
        EmailModule,
        BullModule.registerQueue({
            name: 'marketing-queue',
        }),
    ],
    controllers: [MarketingCampaignController],
    providers: [
        MarketingCampaignService,
        MarketingCampaignProcessor,
        PrismaService,
        AuditLogService,
    ],
    exports: [MarketingCampaignService, BullModule]
})
export class MarketingCampaignModule { }


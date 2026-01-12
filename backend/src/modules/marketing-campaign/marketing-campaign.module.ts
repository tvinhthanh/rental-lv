import { Module } from '@nestjs/common';
import { MarketingCampaignController } from './marketing-campaign.controller';
import { MarketingCampaignService } from './marketing-campaign.service';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';

@Module({
    controllers: [MarketingCampaignController],
    providers: [MarketingCampaignService, PrismaService, AuditLogService],
    exports: [MarketingCampaignService]
})
export class MarketingCampaignModule { }


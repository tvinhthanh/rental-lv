import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { MarketingCampaignService } from './marketing-campaign.service';
import { MarketingCampaignQueryDto } from './dto/marketing-campaign-query.dto';
import { CreateMarketingCampaignDto } from './dto/create-marketing-campaign.dto';
import { UpdateMarketingCampaignDto } from './dto/update-marketing-campaign.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('marketing-campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MarketingCampaignController {
    constructor(private service: MarketingCampaignService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: MarketingCampaignQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateMarketingCampaignDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateMarketingCampaignDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}


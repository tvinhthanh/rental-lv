import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { PricingRuleQueryDto } from './dto/pricing-rule-query.dto';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pricing-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PricingRuleController {
    constructor(private service: PricingRuleService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: PricingRuleQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreatePricingRuleDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdatePricingRuleDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}


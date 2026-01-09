import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerQueryDto } from './dto/partner-query.dto';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('partners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PartnerController {
    constructor(private service: PartnerService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: PartnerQueryDto) {
        return this.service.findAll(query);
    }

    @Get('code/:code')
    @Roles('ADMIN', 'EMPLOYEE')
    findByCode(@Param('code') code: string) {
        return this.service.findByCode(code);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreatePartnerDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdatePartnerDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}


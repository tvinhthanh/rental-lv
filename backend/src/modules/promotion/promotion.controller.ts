import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { PromotionQueryDto } from './dto/promotion-query.dto';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Controller('promotions')
export class PromotionController {
    constructor(private service: PromotionService) { }

    @Get()
    list(@Query() query: PromotionQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreatePromotionDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}

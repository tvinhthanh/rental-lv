import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DepositDetailService } from './deposit-detail.service';
import { DepositDetailQueryDto } from './dto/deposit-detail-query.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';
import { UpdateDepositDetailDto } from './dto/update-deposit-detail.dto';

@Controller('deposit-details')
export class DepositDetailController {
    constructor(private service: DepositDetailService) { }

    @Get()
    list(@Query() query: DepositDetailQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateDepositDetailDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateDepositDetailDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}


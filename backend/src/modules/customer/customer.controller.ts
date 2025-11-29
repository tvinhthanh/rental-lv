import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CustomerQueryDto } from './dto/customer-query.dto';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
export class CustomerController {
    constructor(private service: CustomerService) { }

    @Get()
    list(@Query() query: CustomerQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateCustomerDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/loyalty/:points')
    updateLoyalty(@Param('id') id: string, @Param('points') points: number) {
        return this.service.updateLoyalty(id, Number(points));
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get('user/:userId')
    getByUserId(@Param('userId') userId: string) {
        return this.service.getByUserId(userId);
    }
}

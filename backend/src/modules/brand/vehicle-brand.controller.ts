import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateVehicleBrandDto } from './dto/create-vehicle-brand.dto';
import { UpdateVehicleBrandDto } from './dto/update-vehicle-brand.dto';
import { VehicleBrandQueryDto } from './dto/vehicle-brand-query.dto';
import { VehicleBrandService } from './vehicle-brand.service';

@Controller('brands')
export class VehicleBrandController {
    constructor(private service: VehicleBrandService) { }

    @Get()
    list(@Query() query: VehicleBrandQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateVehicleBrandDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateVehicleBrandDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}

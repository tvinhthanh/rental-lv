import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehicleController {
    constructor(private service: VehicleService) { }

    @Get()
    list(@Query() query: VehicleQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateVehicleDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.service.updateStatus(id, body.status);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get('slug/:slug')
    getBySlug(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }
}

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { VehicleDocumentService } from './vehicle-document.service';
import { VehicleDocumentQueryDto } from './dto/vehicle-document-query.dto';
import { CreateVehicleDocumentDto } from './dto/create-vehicle-document.dto';
import { UpdateVehicleDocumentDto } from './dto/update-vehicle-document.dto';

@Controller('vehicle-documents')
export class VehicleDocumentController {
    constructor(private service: VehicleDocumentService) { }

    @Get()
    list(@Query() query: VehicleDocumentQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateVehicleDocumentDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateVehicleDocumentDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}


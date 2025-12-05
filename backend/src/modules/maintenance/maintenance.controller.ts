import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { MaintenanceQueryDto } from './dto/maintenance-query.dto';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private service: MaintenanceService) { }

    @Get()
    list(@Query() query: MaintenanceQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateMaintenanceDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateMaintenanceDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get('branch/:branchId')
    getByBranch(@Param('branchId') branchId: string) {
        return this.service.findByBranch(branchId);
    }

    @Patch(":id/complete")
    complete(@Param("id") id: string) {
        return this.service.completeMaintenance(id);
    }

}

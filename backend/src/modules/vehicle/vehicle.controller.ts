import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { VehicleQueryDto } from './dto/vehicle-query.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

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
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CreateVehicleDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateVehicleDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser() user: any) {
        return this.service.updateStatus(id, body.status, user?.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }

    @Get('slug/:slug')
    getBySlug(@Param('slug') slug: string) {
        return this.service.findBySlug(slug);
    }

    @Get('branch/:branchId')
    getByBranch(@Param('branchId') branchId: string) {
        return this.service.findByBranch(branchId);
    }
}

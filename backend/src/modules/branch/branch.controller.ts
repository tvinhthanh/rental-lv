import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BranchService } from './branch.service';
import { BranchQueryDto } from './dto/branch-query.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('branches')
export class BranchController {
    constructor(private service: BranchService) { }

    @Get()
    list(@Query() query: BranchQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() dto: CreateBranchDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateBranchDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Patch(':id/deactivate')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    deactivate(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.deactivate(id, user?.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}

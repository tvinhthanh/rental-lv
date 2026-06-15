import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeQueryDto } from './dto/employee-query.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employees')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
    constructor(private service: EmployeeService) { }

    @Get()
    list(@Query() query: EmployeeQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateEmployeeDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get('user/:id')
    getByUserId(@Param('id') id: string) {
        return this.service.getByUserId(id);
    }

}

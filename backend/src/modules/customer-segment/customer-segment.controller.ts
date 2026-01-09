import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CustomerSegmentService } from './customer-segment.service';
import { CustomerSegmentQueryDto } from './dto/customer-segment-query.dto';
import { CreateCustomerSegmentDto } from './dto/create-customer-segment.dto';
import { UpdateCustomerSegmentDto } from './dto/update-customer-segment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customer-segments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomerSegmentController {
    constructor(private service: CustomerSegmentService) { }

    @Get()
    @Roles('ADMIN', 'EMPLOYEE')
    list(@Query() query: CustomerSegmentQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @Roles('ADMIN', 'EMPLOYEE')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @Roles('ADMIN')
    create(@Body() dto: CreateCustomerSegmentDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() dto: UpdateCustomerSegmentDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }
}


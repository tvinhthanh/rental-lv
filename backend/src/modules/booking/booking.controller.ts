import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('bookings')
export class BookingController {
    constructor(private service: BookingService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    list(@Query() query: BookingQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    create(@Body() dto: CreateBookingDto, @CurrentUser() user: any) {
        return this.service.create(dto, user?.id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() dto: UpdateBookingDto, @CurrentUser() user: any) {
        return this.service.update(id, dto, user?.id);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    changeStatus(@Param('id') id: string, @Body() body: { status: string }, @CurrentUser() user: any) {
        return this.service.changeStatus(id, body.status, user?.id);
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    cancel(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
        return this.service.cancel(id, body.reason, user?.id);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    delete(@Param('id') id: string, @CurrentUser() user: any) {
        return this.service.delete(id, user?.id);
    }

    @Get('cars/:carId')
    getDateAvailable(@Param('carId') carId: string) {
        return this.service.getDateAvailable(carId);
    }

    @Get("branch/:branchId")
    @UseGuards(JwtAuthGuard)
    getByBranch(@Param("branchId") branchId: string) {
        return this.service.getByBranch(branchId);
    }
}

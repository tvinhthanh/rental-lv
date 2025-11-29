import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingQueryDto } from './dto/booking-query.dto';

@Controller('bookings')
export class BookingController {
    constructor(private service: BookingService) { }

    @Get()
    list(@Query() query: BookingQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateBookingDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateBookingDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/status')
    changeStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.service.changeStatus(id, body.status);
    }

    @Patch(':id/cancel')
    cancel(@Param('id') id: string, @Body() body: { reason: string }) {
        return this.service.cancel(id, body.reason);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }

    @Get('cars/:carId')
    getDateAvailable(@Param('carId') carId: string) {
        return this.service.getDateAvailable(carId);
    }
}

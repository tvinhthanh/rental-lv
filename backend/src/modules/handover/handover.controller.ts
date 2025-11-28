import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HandoverService } from './handover.service';
import { CreateHandoverDto } from './dto/create-handover.dto';

@Controller('handover')
export class HandoverController {
    constructor(private service: HandoverService) { }

    @Get(':bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.service.findByBooking(bookingId);
    }

    @Post()
    create(@Body() dto: CreateHandoverDto) {
        return this.service.create(dto);
    }
}

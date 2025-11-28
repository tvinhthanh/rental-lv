import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';

@Controller('deposit')
export class DepositController {
    constructor(private service: DepositService) { }

    @Get('detail/:depositId')
    detailList(@Param('depositId') depositId: string) {
        return this.service.listDetails(depositId);
    }

    @Get(':bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.service.findByBooking(bookingId);
    }

    @Post()
    create(@Body() dto: CreateDepositDto) {
        return this.service.create(dto);
    }

    @Post('detail')
    addDetail(@Body() dto: CreateDepositDetailDto) {
        return this.service.addDetail(dto);
    }
}

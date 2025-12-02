import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReturnReportService } from './return-report.service';
import { CreateReturnReportDto } from './dto/create-return-report.dto';

@Controller('return-report')
export class ReturnReportController {
    constructor(private service: ReturnReportService) { }

    @Get(':bookingId')
    findByBooking(@Param('bookingId') bookingId: string) {
        return this.service.findByBooking(bookingId);
    }

    @Post()
    create(@Body() dto: CreateReturnReportDto) {
        return this.service.create(dto);
    }

    @Get('branch/:branchId')
    findByBranch(@Param('branchId') branchId: string) {
        return this.service.findByBranch(branchId);
    }
}

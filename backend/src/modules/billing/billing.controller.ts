import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
    constructor(private billing: BillingService) { }

    // ============ INVOICE ============
    @Get('invoices')
    findAllInvoices() {
        return this.billing.findAllInvoices();
    }

    @Get('invoices/:id')
    findInvoice(@Param('id') id: string) {
        return this.billing.findInvoice(id);
    }

    @Post('invoices')
    createInvoice(@Body() dto: CreateInvoiceDto) {
        return this.billing.createInvoice(dto);
    }

    // ============ PAYMENT ============
    @Post('payments')
    createPayment(@Body() dto: CreatePaymentDto) {
        return this.billing.createPayment(dto);
    }

    @Get('payments/:invoiceId')
    payments(@Param('invoiceId') invoiceId: string) {
        return this.billing.findPayments(invoiceId);
    }

    // ============ SURCHARGE ============
    @Post('surcharges')
    addSurcharge(@Body() dto: CreateSurchargeDto) {
        return this.billing.addSurcharge(dto);
    }

    @Get('surcharges/:invoiceId')
    surcharges(@Param('invoiceId') invoiceId: string) {
        return this.billing.findSurcharges(invoiceId);
    }
}

import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { BillingQueryDto } from './dto/billing-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('billing')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
    constructor(private billing: BillingService) { }

    // ============ INVOICE ============
    @Get('invoices')
    findAllInvoices(@Query() query: BillingQueryDto) {
        return this.billing.findAllInvoices(query);
    }

    @Get('invoices/branch/:branchId')
    findByBranch(@Param('branchId') branchId: string) {
        return this.billing.findByBranch(branchId);
    }

    @Get('invoices/:id')
    findInvoice(@Param('id') id: string) {
        return this.billing.findInvoice(id);
    }

    @Post('invoices')
    createInvoice(@Body() dto: CreateInvoiceDto) {
        return this.billing.createInvoice(dto);
    }

    @Post('invoices/:id/deposit')
    applyDeposit(@Param('id') id: string, @Body() body: { depositApplied: number }) {
        return this.billing.applyDeposit(id, body.depositApplied);
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
    @Get('surcharges')
    findAllSurcharges(@Query() query: BillingQueryDto) {
        return this.billing.findAllSurcharges(query);
    }

    @Get('surcharges/branch/:branchId')
    findSurchargesByBranch(@Param('branchId') branchId: string) {
        return this.billing.findSurchargesByBranch(branchId);
    }

    @Post('surcharges')
    addSurcharge(@Body() dto: CreateSurchargeDto) {
        return this.billing.addSurcharge(dto);
    }

    @Get('surcharges/:invoiceId')
    surcharges(@Param('invoiceId') invoiceId: string) {
        return this.billing.findSurcharges(invoiceId);
    }
}

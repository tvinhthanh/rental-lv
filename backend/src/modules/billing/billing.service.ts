import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) { }

  // ==========================
  // INVOICE
  // ==========================
  findAllInvoices() {
    return this.prisma.invoice.findMany();
  }

  async findInvoice(id: string) {
    const data = await this.prisma.invoice.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Invoice not found');
    return data;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceNo = 'INV-' + randomUUID().slice(0, 8).toUpperCase();

    return this.prisma.invoice.create({
      data: {
        invoiceNo,
        bookingId: dto.bookingId,
        customerId: dto.customerId,
        subtotal: dto.subtotal,
        surchargeTotal: dto.surchargeTotal ?? 0,
        discountTotal: dto.discountTotal ?? 0,
        totalAmount: dto.totalAmount
      }
    });
  }

  // ==========================
  // PAYMENT
  // ==========================
  async createPayment(dto: CreatePaymentDto) {
    const invoice = await this.findInvoice(dto.invoiceId);

    await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        method: dto.method,
        amount: dto.amount,
        referenceNo: dto.referenceNo,
        note: dto.note
      }
    });

    return { message: 'Payment recorded successfully' };
  }

  findPayments(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId }
    });
  }

  // ==========================
  // SURCHARGE
  // ==========================
  async addSurcharge(dto: CreateSurchargeDto) {
    await this.findInvoice(dto.invoiceId);

    const surcharge = await this.prisma.surcharge.create({
      data: {
        invoiceId: dto.invoiceId,
        name: dto.name,
        description: dto.reason,
        amount: dto.amount
      }
    });

    await this.recalcInvoiceTotals(dto.invoiceId);
    return surcharge;
  }

  findSurcharges(invoiceId: string) {
    return this.prisma.surcharge.findMany({
      where: { invoiceId }
    });
  }

  private async recalcInvoiceTotals(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return;

    const surchargeAgg = await this.prisma.surcharge.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    });

    const surchargeTotal = surchargeAgg._sum.amount ?? 0;
    const subtotal = invoice.subtotal ?? 0;
    const discountTotal = invoice.discountTotal ?? 0;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        surchargeTotal,
        totalAmount: subtotal + surchargeTotal - discountTotal
      }
    });
  }
}

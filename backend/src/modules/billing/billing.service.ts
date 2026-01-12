import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateSurchargeDto } from './dto/create-surcharge.dto';
import { BillingQueryDto } from './dto/billing-query.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) { }

  // =====
  // INVOICE
  // =====
  async findAllInvoices(query: BillingQueryDto = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.branchId) {
      where.booking = {
        branchId: query.branchId
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { invoiceNo: { contains: query.search, mode: 'insensitive' } },
        { booking: { bookingCode: { contains: query.search, mode: 'insensitive' } } },
        { customer: { fullName: { contains: query.search, mode: 'insensitive' } } }
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
      include: {
        booking: {
          include: {
            customer: true,
            vehicle: true,
            branch: true
          }
        },
        customer: true,
        payments: true,
        surcharges: true
      },
      orderBy: { createdAt: 'desc' }
      }),
      this.prisma.invoice.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByBranch(branchId: string) {
    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where: {
          booking: {
            branchId
          }
        },
        include: {
          booking: {
            include: {
              customer: true,
              vehicle: {
                include: {
                  category: true,
                  branch: true
                }
              },
              branch: true
            }
          },
          customer: true,
          payments: true,
          surcharges: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.invoice.count({
        where: {
          booking: {
            branchId
          }
        }
      })
    ]);

    return {
      items,
      total
    };
  }

  async findInvoice(id: string) {
    const data = await this.prisma.invoice.findUnique({ where: { id } });
    if (!data) throw new NotFoundException('Invoice not found');
    return data;
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const invoiceNo = 'INV-' + randomUUID().slice(0, 8).toUpperCase();

    const subtotal = dto.baseAmount;
    const surchargeTotal = dto.surchargeTotal ?? 0;
    const discountTotal = dto.discountTotal ?? 0;
    const depositApplied = dto.depositApplied ?? 0;
    const totalAmount = subtotal + surchargeTotal - discountTotal - depositApplied;

    return this.prisma.invoice.create({
      data: {
        invoiceNo,
        bookingId: dto.bookingId,
        customerId: dto.customerId,
        subtotal,
        surchargeTotal,
        discountTotal,
        depositApplied,
        totalAmount
      }
    });
  }

  //  PAYMENT 
  async createPayment(dto: CreatePaymentDto) {
    const invoice = await this.findInvoice(dto.invoiceId);

    await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        method: dto.method,
        amount: dto.amount,
        referenceNo: dto.referenceNo,
        note: dto.note,
        status: 'SUCCESS'
      }
    });

    await this.recalcInvoiceTotals(dto.invoiceId);
    return { message: 'Payment recorded successfully' };
  }

  /**
   * Tạo thanh toán tiền mặt
   */
  async createCashPayment(dto: CreatePaymentDto) {
    const invoice = await this.findInvoice(dto.invoiceId);

    // Tạo payment với method = CASH
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId: dto.invoiceId,
        method: 'CASH',
        amount: dto.amount,
        referenceNo: dto.referenceNo || `CASH-${Date.now()}`,
        note: dto.note || 'Thanh toán tiền mặt',
        status: 'SUCCESS', // Tiền mặt luôn thành công khi nhận
        paidAt: new Date(),
      }
    });

    // Recalculate invoice totals
    await this.recalcInvoiceTotals(dto.invoiceId);

    return {
      message: 'Cash payment recorded successfully',
      payment
    };
  }

  findPayments(invoiceId: string) {
    return this.prisma.payment.findMany({
      where: { invoiceId }
    });
  }

  async applyDeposit(invoiceId: string, depositApplied: number) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { depositApplied }
    });

    await this.recalcInvoiceTotals(invoiceId);
    return { message: 'Deposit applied' };
  }

  //  SURCHARGE 
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

  async findAllSurcharges(query: BillingQueryDto = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.branchId) {
      where.invoice = {
        booking: {
          branchId: query.branchId
        }
      };
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.surcharge.findMany({
        where,
        skip,
        take: limit,
      include: {
        invoice: {
          include: {
            booking: {
              include: {
                customer: true,
                vehicle: {
                  include: {
                    category: true,
                    branch: true
                  }
                },
                branch: true
              }
            },
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
      }),
      this.prisma.surcharge.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  findSurchargesByBranch(branchId: string) {
    return this.prisma.surcharge.findMany({
      where: {
        invoice: {
          booking: {
            branchId
          }
        }
      },
      include: {
        invoice: {
          include: {
            booking: {
              include: {
                customer: true,
                vehicle: {
                  include: {
                    category: true,
                    branch: true
                  }
                },
                branch: true
              }
            },
            customer: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  private async recalcInvoiceTotals(invoiceId: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return;

    const surchargeAgg = await this.prisma.surcharge.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    });

    const paymentAgg = await this.prisma.payment.aggregate({
      where: { invoiceId },
      _sum: { amount: true }
    });

    const surchargeTotal = surchargeAgg._sum.amount ?? 0;
    const paymentsTotal = paymentAgg._sum.amount ?? 0;
    const subtotal = invoice.subtotal ?? 0;
    const discountTotal = invoice.discountTotal ?? 0;
    const depositApplied = invoice.depositApplied ?? 0;

    const totalAmount = subtotal + surchargeTotal - discountTotal - depositApplied;
    const status = paymentsTotal >= totalAmount ? 'PAID' : invoice.status;

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        surchargeTotal,
        totalAmount,
        status
      }
    });

    // if invoice is PAID → change booking to COMPLETED
    if (status === 'PAID') {
      const booking = await this.prisma.booking.findUnique({
        where: { id: updatedInvoice.bookingId }
      });

      if (booking && booking.status !== 'COMPLETED') {
        await this.prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'COMPLETED' }
        });
      }
    }
  }
}

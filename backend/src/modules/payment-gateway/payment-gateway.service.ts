import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class PaymentGatewayService {
  private stripe: Stripe | null = null;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      console.warn('⚠️ STRIPE_SECRET_KEY not found in environment variables');
    } else {
      this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2026-02-25.clover' as any,
      });
    }
  }

  /**
   * Tạo Stripe Payment Intent
   */
  async createPaymentIntent(invoiceId: string, amount: number, currency: string = 'vnd') {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true, booking: true },
    });

    if (!invoice) {
      throw new BadRequestException('Invoice not found');
    }

    // Convert VND to cents (Stripe uses smallest currency unit)
    // Note: VND doesn't have cents, so we use the amount directly
    // For other currencies, multiply by 100 to convert to cents
    const amountInSmallestUnit = currency === 'vnd' ? Math.round(amount) : Math.round(amount * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency === 'vnd' ? 'vnd' : currency,
      metadata: {
        invoiceId,
        bookingId: invoice.bookingId,
        customerId: invoice.customerId,
        invoiceNo: invoice.invoiceNo,
      },
      description: `Thanh toán hóa đơn ${invoice.invoiceNo}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Lưu payment intent ID vào database
    await this.prisma.payment.create({
      data: {
        invoiceId,
        method: 'STRIPE',
        amount,
        referenceNo: paymentIntent.id,
        status: 'PENDING',
        note: `Stripe Payment Intent: ${paymentIntent.id}`,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  /**
   * Xác thực webhook từ Stripe
   */
  async verifyWebhook(signature: string, body: string): Promise<Stripe.Event> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(`Webhook signature verification failed: ${errorMessage}`);
    }
  }

  /**
   * Xử lý webhook events từ Stripe
   */
  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case 'charge.refunded':
        await this.handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Xử lý khi thanh toán thành công
   */
  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const invoiceId = paymentIntent.metadata?.invoiceId;
    if (!invoiceId) {
      console.error('Invoice ID not found in payment intent metadata');
      return;
    }

    // Update payment status
    await this.prisma.payment.updateMany({
      where: {
        referenceNo: paymentIntent.id,
        status: 'PENDING',
      },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    // Update invoice status
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments
        .filter((p: any) => p.status === 'SUCCESS')
        .reduce((sum: number, p: any) => sum + p.amount, 0);

      if (totalPaid >= invoice.totalAmount) {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PAID' },
        });
      } else {
        await this.prisma.invoice.update({
          where: { id: invoiceId },
          data: { status: 'PARTIAL' },
        });
      }
    }
  }

  /**
   * Xử lý khi thanh toán thất bại
   */
  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    await this.prisma.payment.updateMany({
      where: {
        referenceNo: paymentIntent.id,
        status: 'PENDING',
      },
      data: {
        status: 'FAILED',
      },
    });
  }

  /**
   * Xử lý refund
   */
  private async handleRefund(charge: Stripe.Charge) {
    // Implement refund logic if needed
    console.log('Refund processed:', charge.id);
  }

  /**
   * Lấy thông tin payment intent
   */
  async getPaymentIntent(paymentIntentId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    return await this.stripe.paymentIntents.retrieve(paymentIntentId);
  }

  /**
   * Tạo refund
   */
  async createRefund(paymentId: string, amount?: number) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment || !payment.referenceNo) {
      throw new BadRequestException('Payment not found or invalid');
    }

    const refund = await this.stripe.refunds.create({
      payment_intent: payment.referenceNo,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents if amount specified
    });

    return refund;
  }
}

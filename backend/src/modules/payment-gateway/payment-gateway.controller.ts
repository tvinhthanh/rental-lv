import { Body, Controller, Post, Get, Param, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { PaymentGatewayService } from './payment-gateway.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('payment-gateway')
export class PaymentGatewayController {
  constructor(private paymentGatewayService: PaymentGatewayService) {}

  /**
   * Tạo Stripe Payment Intent
   */
  @Post('stripe/create-intent')
  @UseGuards(JwtAuthGuard)
  async createPaymentIntent(
    @Body() body: { invoiceId: string; amount: number; currency?: string },
  ) {
    return this.paymentGatewayService.createPaymentIntent(
      body.invoiceId,
      body.amount,
      body.currency || 'vnd',
    );
  }

  /**
   * Webhook endpoint cho Stripe
   */
  @Post('stripe/webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const event = await this.paymentGatewayService.verifyWebhook(
      signature,
      req.rawBody?.toString() || '',
    );

    await this.paymentGatewayService.handleWebhookEvent(event);

    return { received: true };
  }

  /**
   * Lấy thông tin payment intent
   */
  @Get('stripe/payment-intent/:id')
  @UseGuards(JwtAuthGuard)
  async getPaymentIntent(@Param('id') id: string) {
    return this.paymentGatewayService.getPaymentIntent(id);
  }

  /**
   * Tạo refund
   */
  @Post('stripe/refund')
  @UseGuards(JwtAuthGuard)
  async createRefund(@Body() body: { paymentId: string; amount?: number }) {
    return this.paymentGatewayService.createRefund(body.paymentId, body.amount);
  }
}

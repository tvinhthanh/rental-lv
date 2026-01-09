import { Module } from '@nestjs/common';
import { PaymentGatewayController } from './payment-gateway.controller';
import { PaymentGatewayService } from './payment-gateway.service';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [PaymentGatewayController],
  providers: [PaymentGatewayService, PrismaService],
  exports: [PaymentGatewayService],
})
export class PaymentGatewayModule {}

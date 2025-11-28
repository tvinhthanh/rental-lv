import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

import { BranchModule } from './modules/branch/branch.module';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { BookingModule } from './modules/booking/booking.module';
import { BillingModule } from './modules/billing/billing.module';
import { VehicleCategoryModule } from './modules/vehicle-category/vehicle-category.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PriceListModule } from './modules/price-list/price-list.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { DepositModule } from './modules/deposit/deposit.module';
import { HandoverModule } from './modules/handover/handover.module';
import { CustomerModule } from './modules/customer/customer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    BranchModule,
    VehicleModule,
    BookingModule,
    BillingModule,
    VehicleCategoryModule,
    CloudinaryModule,
    AuditLogModule,

    PriceListModule,
    DepositModule,
    HandoverModule,
    CustomerModule
  ],
})
export class AppModule { }

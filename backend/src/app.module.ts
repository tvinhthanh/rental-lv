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
import { VehicleBrandModule } from './modules/brand/vehicle-brand.module';
import { EmployeeModule } from './modules/employee/employee.module';
import { ReturnReportModule } from './modules/return-report/return-report.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { ContractModule } from './modules/contact/contract.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { BlogModule } from './modules/blog/blog.module';
import { PageModule } from './modules/page/page.module';
import { ReviewModule } from './modules/review/review.module';
import { VehicleDocumentModule } from './modules/vehicle-document/vehicle-document.module';
import { DepositDetailModule } from './modules/deposit-detail/deposit-detail.module';
import { NotificationModule } from './modules/notification/notification.module';

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
    VehicleBrandModule,
    PriceListModule,
    DepositModule,
    HandoverModule,
    CustomerModule,
    EmployeeModule,
    ReturnReportModule,
    MaintenanceModule,
    ContractModule,
    PromotionModule,
    BlogModule,
    PageModule,
    ReviewModule,
    VehicleDocumentModule,
    DepositDetailModule,
    NotificationModule
  ],
})
export class AppModule { }

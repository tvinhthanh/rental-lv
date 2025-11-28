"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const branch_module_1 = require("./modules/branch/branch.module");
const vehicle_module_1 = require("./modules/vehicle/vehicle.module");
const booking_module_1 = require("./modules/booking/booking.module");
const billing_module_1 = require("./modules/billing/billing.module");
const vehicle_category_module_1 = require("./modules/vehicle-category/vehicle-category.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const price_list_module_1 = require("./modules/price-list/price-list.module");
const audit_log_module_1 = require("./modules/audit-log/audit-log.module");
const deposit_module_1 = require("./modules/deposit/deposit.module");
const handover_module_1 = require("./modules/handover/handover.module");
const customer_module_1 = require("./modules/customer/customer.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            branch_module_1.BranchModule,
            vehicle_module_1.VehicleModule,
            booking_module_1.BookingModule,
            billing_module_1.BillingModule,
            vehicle_category_module_1.VehicleCategoryModule,
            cloudinary_module_1.CloudinaryModule,
            audit_log_module_1.AuditLogModule,
            price_list_module_1.PriceListModule,
            deposit_module_1.DepositModule,
            handover_module_1.HandoverModule,
            customer_module_1.CustomerModule
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
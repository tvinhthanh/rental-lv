"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleBrandModule = void 0;
const common_1 = require("@nestjs/common");
const vehicle_brand_controller_1 = require("./vehicle-brand.controller");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const vehicle_brand_service_1 = require("./vehicle-brand.service");
let VehicleBrandModule = class VehicleBrandModule {
};
exports.VehicleBrandModule = VehicleBrandModule;
exports.VehicleBrandModule = VehicleBrandModule = __decorate([
    (0, common_1.Module)({
        controllers: [vehicle_brand_controller_1.VehicleBrandController],
        providers: [vehicle_brand_service_1.VehicleBrandService, prisma_service_1.PrismaService, audit_log_service_1.AuditLogService],
    })
], VehicleBrandModule);
//# sourceMappingURL=vehicle-brand.module.js.map
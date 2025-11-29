"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleBrandController = void 0;
const common_1 = require("@nestjs/common");
const create_vehicle_brand_dto_1 = require("./dto/create-vehicle-brand.dto");
const update_vehicle_brand_dto_1 = require("./dto/update-vehicle-brand.dto");
const vehicle_brand_query_dto_1 = require("./dto/vehicle-brand-query.dto");
const vehicle_brand_service_1 = require("./vehicle-brand.service");
let VehicleBrandController = class VehicleBrandController {
    constructor(service) {
        this.service = service;
    }
    list(query) {
        return this.service.findAll(query);
    }
    detail(id) {
        return this.service.findOne(id);
    }
    create(dto) {
        return this.service.create(dto);
    }
    update(id, dto) {
        return this.service.update(id, dto);
    }
    delete(id) {
        return this.service.delete(id);
    }
};
exports.VehicleBrandController = VehicleBrandController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vehicle_brand_query_dto_1.VehicleBrandQueryDto]),
    __metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehicle_brand_dto_1.CreateVehicleBrandDto]),
    __metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_vehicle_brand_dto_1.UpdateVehicleBrandDto]),
    __metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VehicleBrandController.prototype, "delete", null);
exports.VehicleBrandController = VehicleBrandController = __decorate([
    (0, common_1.Controller)('brands'),
    __metadata("design:paramtypes", [vehicle_brand_service_1.VehicleBrandService])
], VehicleBrandController);
//# sourceMappingURL=vehicle-brand.controller.js.map
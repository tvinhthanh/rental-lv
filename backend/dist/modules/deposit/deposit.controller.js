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
exports.DepositController = void 0;
const common_1 = require("@nestjs/common");
const deposit_service_1 = require("./deposit.service");
const create_deposit_dto_1 = require("./dto/create-deposit.dto");
const create_deposit_detail_dto_1 = require("./dto/create-deposit-detail.dto");
let DepositController = class DepositController {
    constructor(service) {
        this.service = service;
    }
    detailList(depositId) {
        return this.service.listDetails(depositId);
    }
    findByBooking(bookingId) {
        return this.service.findByBooking(bookingId);
    }
    create(dto) {
        return this.service.create(dto);
    }
    addDetail(dto) {
        return this.service.addDetail(dto);
    }
};
exports.DepositController = DepositController;
__decorate([
    (0, common_1.Get)('detail/:depositId'),
    __param(0, (0, common_1.Param)('depositId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "detailList", null);
__decorate([
    (0, common_1.Get)(':bookingId'),
    __param(0, (0, common_1.Param)('bookingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "findByBooking", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_deposit_dto_1.CreateDepositDto]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('detail'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_deposit_detail_dto_1.CreateDepositDetailDto]),
    __metadata("design:returntype", void 0)
], DepositController.prototype, "addDetail", null);
exports.DepositController = DepositController = __decorate([
    (0, common_1.Controller)('deposit'),
    __metadata("design:paramtypes", [deposit_service_1.DepositService])
], DepositController);
//# sourceMappingURL=deposit.controller.js.map
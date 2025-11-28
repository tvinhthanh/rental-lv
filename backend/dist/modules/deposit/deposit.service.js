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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepositService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
let DepositService = class DepositService {
    constructor(prisma, audit) {
        this.prisma = prisma;
        this.audit = audit;
    }
    async findByBooking(bookingId) {
        return this.prisma.deposit.findUnique({
            where: { bookingId },
            include: { items: true }
        });
    }
    async create(dto, actorId) {
        var _a;
        const booking = await this.prisma.booking.findUnique({
            where: { id: dto.bookingId }
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId }
        });
        if (!customer)
            throw new common_1.NotFoundException('Customer not found');
        const exists = await this.prisma.deposit.findUnique({
            where: { bookingId: dto.bookingId }
        });
        if (exists) {
            throw new common_1.BadRequestException('Deposit already exists for this booking');
        }
        const deposit = await this.prisma.deposit.create({
            data: {
                bookingId: dto.bookingId,
                customerId: dto.customerId,
                totalAmount: dto.totalAmount,
                status: (_a = dto.status) !== null && _a !== void 0 ? _a : 'HELD',
                notes: dto.notes
            }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'CREATE', 'Deposit', deposit.id, deposit);
        return deposit;
    }
    async addDetail(dto, actorId) {
        var _a;
        const deposit = await this.prisma.deposit.findUnique({
            where: { id: dto.depositId }
        });
        if (!deposit)
            throw new common_1.NotFoundException('Deposit not found');
        const detail = await this.prisma.depositDetail.create({
            data: {
                depositId: dto.depositId,
                itemType: dto.itemType,
                itemName: dto.itemName,
                identifier: dto.identifier,
                amount: dto.amount,
                condition: dto.condition,
                photoUrls: (_a = dto.photoUrls) !== null && _a !== void 0 ? _a : [],
                notes: dto.notes
            }
        });
        await this.audit.log(actorId !== null && actorId !== void 0 ? actorId : null, 'CREATE_DETAIL', 'Deposit', deposit.id, detail);
        return detail;
    }
    async listDetails(depositId) {
        return this.prisma.depositDetail.findMany({
            where: { depositId },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.DepositService = DepositService;
exports.DepositService = DepositService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        audit_log_service_1.AuditLogService])
], DepositService);
//# sourceMappingURL=deposit.service.js.map
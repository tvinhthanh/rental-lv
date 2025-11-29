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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const user_service_1 = require("../user/user.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(jwtService, userService, audit, prisma) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.audit = audit;
        this.prisma = prisma;
    }
    async validateUser(email, pass) {
        const user = await this.userService.findByEmail(email);
        if (!user)
            return null;
        const match = await bcrypt.compare(pass, user.password);
        if (!match)
            return null;
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User is deactivated');
        }
        return user;
    }
    async login(dto) {
        const user = await this.validateUser(dto.email, dto.password);
        if (!user) {
            await this.audit.log(null, 'LOGIN_FAILED', 'Auth', undefined, {
                email: dto.email
            });
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET || 'change-this-secret',
            expiresIn: process.env.JWT_EXPIRES_IN || '1d'
        });
        await this.userService.updateLastLogin(user.id);
        await this.audit.log(user.id, 'LOGIN', 'Auth');
        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };
    }
    async register(dto, cusDto) {
        var _a;
        const exists = await this.userService.findByEmail(dto.email);
        if (exists)
            throw new common_1.BadRequestException('Email already exists');
        const user = await this.userService.create({
            email: dto.email,
            password: dto.password,
            name: dto.name,
            role: 'USER'
        });
        const customer = await this.prisma.customer.create({
            data: {
                userId: user.id,
                fullName: (_a = cusDto.fullName) !== null && _a !== void 0 ? _a : '',
                email: cusDto.email,
                phone: cusDto.phone,
                address: cusDto.address,
                dateOfBirth: cusDto.dateOfBirth,
                gender: cusDto.gender,
                driverLicenseNo: cusDto.driverLicenseNo,
                driverLicenseExpiry: cusDto.driverLicenseExpiry,
                nationalId: cusDto.nationalId,
                nationality: cusDto.nationality,
                avatarUrl: cusDto.avatarUrl
            }
        });
        await this.audit.log(user.id, 'REGISTER', 'Auth', user.id, {
            customerId: customer.id
        });
        return {
            userId: user.id,
            customerId: customer.id,
            email: user.email,
            name: user.name
        };
    }
    async me(user) {
        return this.userService.findOne(user.id);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        user_service_1.UserService,
        audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
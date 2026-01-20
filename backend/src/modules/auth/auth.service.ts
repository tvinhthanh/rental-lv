import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { EmailService } from '../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CustomerDTO, EmployeeDTO } from './dto/user.dto';
import { CreateEmployeeDto } from '../employee/dto/create-employee.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
    private audit: AuditLogService,
    private prisma: PrismaService,
    private emailService: EmailService
  ) { }

  async validateUser(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.password);
    if (!match) return null;

    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    return user;
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      await this.audit.log(null, 'LOGIN_FAILED', 'Auth', undefined, {
        email: dto.email
      });
      throw new UnauthorizedException('Invalid credentials');
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

  async register(dto: RegisterDto, cusDto: CustomerDTO) {
    // Check email tồn tại
    const exists = await this.userService.findByEmail(dto.email);
    if (exists) throw new BadRequestException('Email already exists');

    // Tạo User
    const user = await this.userService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
      role: 'USER' //ROLE : USER => GÁN CUSTOMERS
    });

    const customer = await this.prisma.customer.create({
      data: {
        userId: user.id,
        fullName: cusDto.fullName ?? '',
        email: cusDto.email,
        phone: cusDto.phone as string,
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


    // Ghi Audit Log
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

  async createEmployee(dto: RegisterDto, empDto: CreateEmployeeDto) {
    // 1) Check email tồn tại trong User
    const exists = await this.userService.findByEmail(dto.email);
    if (exists) {
      throw new BadRequestException("Email already exists");
    }

    // 2) Tạo User với role = EMPLOYEE
    const user = await this.userService.create({
      email: dto.email,
      password: "123456",
      name: dto.name,
      role: "EMPLOYEE",
    });

    // 3) Tạo Employee record mapping userId
    const employee = await this.prisma.employee.create({
      data: {
        userId: user.id,
        fullName: dto.name || empDto.fullName || "",
        phone: empDto.phone,
        email: dto.email,
        nationalId: empDto.nationalId,
        department: empDto.department,
        position: empDto.position,
        salary: empDto.salary,
        status: empDto.status ?? "ACTIVE",
        hireDate: empDto.hireDate ? new Date(empDto.hireDate) : undefined,
        avatarUrl: empDto.avatarUrl,
        branchId: empDto.branchId,
      },
    });

    return {
      message: "Employee created successfully",
      user,
      employee,
    };
  }

  async me(user: any) {
    return this.userService.findOne(user.id);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    // Find user by email
    const user = await this.userService.findByEmail(dto.email);
    
    // Always return success message for security (don't reveal if email exists)
    // In production, you would:
    // 1. Generate a reset token (JWT with short expiry or random token stored in DB)
    // 2. Save token to database with expiry time
    // 3. Send email with reset link containing the token
    // 4. User clicks link → goes to reset password page → submits new password with token
    
    if (user) {
      // Generate reset token (JWT with 1 hour expiry)
      const resetToken = await this.jwtService.signAsync(
        { sub: user.id, email: user.email, type: 'password-reset' },
        {
          secret: process.env.JWT_SECRET || 'change-this-secret',
          expiresIn: '1h'
        }
      );

      // TODO: In production, save resetToken to database with expiry
      // await this.prisma.passwordReset.create({
      //   data: {
      //     userId: user.id,
      //     token: resetToken,
      //     expiresAt: new Date(Date.now() + 3600000) // 1 hour
      //   }
      // });

      // TODO: Send email with reset link
      // await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      // Log the action
      await this.audit.log(user.id, 'FORGOT_PASSWORD_REQUEST', 'Auth', user.id, {
        email: dto.email
      });

      // For now, just log the token (in production, this would be sent via email)
      console.log(`Password reset token for ${dto.email}: ${resetToken}`);
    } else {
      // Log failed attempt (but don't reveal to user)
      await this.audit.log(null, 'FORGOT_PASSWORD_FAILED', 'Auth', undefined, {
        email: dto.email
      });
    }

    // Always return success message (security best practice)
    return {
      message: 'If an account with that email exists, a password reset link has been sent.',
      success: true
    };
  }
}

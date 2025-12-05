import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditLogService
  ) { }

  //  QUERY LIST 
  async findAll(query: UserQueryDto) {
    const page = query.page ? Number(query.page) : 1;
    const limit = query.limit ? Number(query.limit) : 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive === 'true';

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  //  FIND ONE 
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  //  CREATE 
  async create(dto: CreateUserDto, actorId?: string) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists');

    const hashed = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        name: dto.name ?? dto.email.split('@')[0],
        role: dto.role ?? 'CUSTOMER'
      }
    });

    await this.audit.log(actorId || null, 'CREATE', 'User', user.id, user);

    return user;
  }

  //  UPDATE 
  async update(id: string, dto: UpdateUserDto, actorId?: string) {
    const before = await this.findOne(id);

    if (dto.email && dto.email !== before.email) {
      const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('Email already exists');
    }

    const data: any = { ...dto };

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data
    });

    await this.audit.log(actorId || null, 'UPDATE', 'User', id, {
      before,
      after: user
    });

    return user;
  }

  //  CHANGE PASSWORD 
  async changePassword(id: string, body: ChangePasswordDto, actorId: string) {
    const user = await this.findOne(id);

    const match = await bcrypt.compare(body.oldPassword, user.password);
    if (!match) throw new BadRequestException('Old password incorrect');

    const hashed = await bcrypt.hash(body.newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashed }
    });

    await this.audit.log(actorId, 'CHANGE_PASSWORD', 'User', id);

    return { message: 'Password changed successfully' };
  }

  //  RESET PASSWORD (ADMIN) 
  async resetPassword(id: string, body: ResetPasswordDto, actorId: string) {
    const hashed = await bcrypt.hash(body.newPassword, 10);

    await this.audit.log(actorId, 'RESET_PASSWORD', 'User', id, {
      newPassword: '**HIDDEN**'
    });

    return this.prisma.user.update({
      where: { id },
      data: { password: hashed }
    });
  }

  //  UPDATE ROLE (ADMIN) 
  async updateRole(id: string, body: UpdateRoleDto, actorId: string) {
    const user = await this.findOne(id);

    if (id === actorId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: body.role }
    });

    await this.audit.log(actorId, 'UPDATE_ROLE', 'User', id, {
      from: user.role,
      to: body.role
    });

    return updated;
  }

  //  LAST LOGIN (AUTH CALL) 
  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  //  SOFT DELETE 
  async softDelete(id: string, actorId: string) {
    await this.audit.log(actorId, 'SOFT_DELETE', 'User', id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
  }

  //  HARD DELETE + CASCADE 
  async hardDelete(id: string, actorId: string) {
    await this.audit.log(actorId, 'HARD_DELETE', 'User', id);

    await this.prisma.customer.deleteMany({ where: { userId: id } });
    await this.prisma.employee.deleteMany({ where: { userId: id } });
    await this.prisma.passwordResetToken.deleteMany({ where: { userId: id } });
    await this.prisma.notification.deleteMany({ where: { userId: id } });

    return this.prisma.user.delete({ where: { id } });
  }
}

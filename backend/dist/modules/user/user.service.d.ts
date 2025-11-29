import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from '@/prisma/prisma.service';
export declare class UserService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditLogService);
    findAll(query: UserQueryDto): Promise<{
        items: {
            id: string;
            email: string;
            password: string;
            name: string | null;
            role: string;
            isActive: boolean;
            lastLogin: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findByEmail(email: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(dto: CreateUserDto, actorId?: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateUserDto, actorId?: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    changePassword(id: string, body: ChangePasswordDto, actorId: string): Promise<{
        message: string;
    }>;
    resetPassword(id: string, body: ResetPasswordDto, actorId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(id: string, body: UpdateRoleDto, actorId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateLastLogin(id: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    softDelete(id: string, actorId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    hardDelete(id: string, actorId: string): Promise<{
        id: string;
        email: string;
        password: string;
        name: string | null;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

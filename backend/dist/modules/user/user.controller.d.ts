import { UserService } from './user.service';
import { UserQueryDto } from './dto/user-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
export declare class UserController {
    private readonly service;
    constructor(service: UserService);
    getAll(query: UserQueryDto): Promise<{
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
    getOne(id: string): Promise<{
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
    create(dto: CreateUserDto): Promise<{
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
    update(id: string, dto: UpdateUserDto): Promise<{
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
    changePassword(id: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(id: string, dto: ResetPasswordDto): Promise<{
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
    updateRole(id: string, dto: UpdateRoleDto): Promise<{
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
    disable(id: string): Promise<{
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
    hardDelete(id: string): Promise<{
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

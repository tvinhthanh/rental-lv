import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { CustomerDTO } from './dto/user.dto';
export declare class AuthService {
    private jwtService;
    private userService;
    private audit;
    private prisma;
    constructor(jwtService: JwtService, userService: UserService, audit: AuditLogService, prisma: PrismaService);
    validateUser(email: string, pass: string): Promise<{
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
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: string;
        };
    }>;
    register(dto: RegisterDto, cusDto: CustomerDTO): Promise<{
        userId: string;
        customerId: string;
        email: string;
        name: string | null;
    }>;
    me(user: any): Promise<{
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

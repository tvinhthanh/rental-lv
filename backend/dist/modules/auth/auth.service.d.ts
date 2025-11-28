import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private jwtService;
    private userService;
    private audit;
    constructor(jwtService: JwtService, userService: UserService, audit: AuditLogService);
    validateUser(email: string, pass: string): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
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
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string | null;
    }>;
    me(user: any): Promise<{
        id: string;
        createdAt: Date;
        name: string | null;
        email: string;
        password: string;
        role: string;
        isActive: boolean;
        lastLogin: Date | null;
        updatedAt: Date;
    }>;
}

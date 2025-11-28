import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getMe(user: any): Promise<{
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

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { CustomerDTO } from './dto/user.dto';
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
    register(dto: RegisterDto, cusDto: CustomerDTO): Promise<{
        userId: string;
        customerId: string;
        email: string;
        name: string | null;
    }>;
    getMe(user: any): Promise<{
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

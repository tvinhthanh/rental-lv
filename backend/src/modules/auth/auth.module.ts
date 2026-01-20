import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-this-secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService, AuditLogService],
  exports: [AuthService]
})
export class AuthModule { }

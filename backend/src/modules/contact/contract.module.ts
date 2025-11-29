import { Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ContractService } from './contract.service';
import { ContractController } from './contract.controller';
import { CloudinaryModule } from '@/cloudinary/cloudinary.module';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Module({
    imports: [CloudinaryModule],
    controllers: [ContractController],
    providers: [ContractService, PrismaService, AuditLogService, CloudinaryService],
    exports: [ContractService]
})
export class ContractModule { }

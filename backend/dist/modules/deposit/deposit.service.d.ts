import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';
export declare class DepositService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditLogService);
    findByBooking(bookingId: string): Promise<({
        items: {
            id: string;
            depositId: string;
            itemType: string;
            itemName: string | null;
            identifier: string | null;
            amount: number | null;
            condition: string | null;
            photoUrls: string[];
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        bookingId: string;
        customerId: string;
        totalAmount: number;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(dto: CreateDepositDto, actorId?: string): Promise<{
        id: string;
        bookingId: string;
        customerId: string;
        totalAmount: number;
        status: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addDetail(dto: CreateDepositDetailDto, actorId?: string): Promise<{
        id: string;
        depositId: string;
        itemType: string;
        itemName: string | null;
        identifier: string | null;
        amount: number | null;
        condition: string | null;
        photoUrls: string[];
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listDetails(depositId: string): Promise<{
        id: string;
        depositId: string;
        itemType: string;
        itemName: string | null;
        identifier: string | null;
        amount: number | null;
        condition: string | null;
        photoUrls: string[];
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}

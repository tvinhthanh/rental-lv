import { PrismaService } from '@/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
export declare class HandoverService {
    private prisma;
    private audit;
    constructor(prisma: PrismaService, audit: AuditLogService);
    findByBooking(bookingId: string): Promise<({
        booking: {
            id: string;
            bookingCode: string;
            customerId: string;
            vehicleId: string;
            branchId: string;
            returnBranchId: string | null;
            pickupDate: Date;
            returnDate: Date;
            status: string;
            baseAmount: number;
            discountAmount: number;
            totalAmount: number;
            promotionId: string | null;
            cancelReason: string | null;
            note: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        bookingId: string;
        odoStart: number | null;
        fuelLevelStart: number | null;
        pickupPlace: string | null;
        exteriorStatus: string | null;
        interiorStatus: string | null;
        damageNote: string | null;
        accessories: string | null;
        customerSignature: string | null;
        handedOverBy: string | null;
        photoUrls: string[];
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    create(dto: CreateHandoverDto, actorId?: string): Promise<{
        id: string;
        bookingId: string;
        odoStart: number | null;
        fuelLevelStart: number | null;
        pickupPlace: string | null;
        exteriorStatus: string | null;
        interiorStatus: string | null;
        damageNote: string | null;
        accessories: string | null;
        customerSignature: string | null;
        handedOverBy: string | null;
        photoUrls: string[];
        createdAt: Date;
        updatedAt: Date;
    }>;
}

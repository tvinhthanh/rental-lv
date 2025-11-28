import { DepositService } from './deposit.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateDepositDetailDto } from './dto/create-deposit-detail.dto';
export declare class DepositController {
    private service;
    constructor(service: DepositService);
    detailList(depositId: string): Promise<{
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
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        bookingId: string;
        customerId: string;
        totalAmount: number;
        status: string;
    }) | null>;
    create(dto: CreateDepositDto): Promise<{
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        bookingId: string;
        customerId: string;
        totalAmount: number;
        status: string;
    }>;
    addDetail(dto: CreateDepositDetailDto): Promise<{
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
}

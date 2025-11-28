import { AuditLogQueryDto } from './dto/audit-log-query.dto';
import { PrismaService } from '@/prisma/prisma.service';
export declare class AuditLogService {
    private prisma;
    constructor(prisma: PrismaService);
    log(userId: string | null | undefined, action: string, module: string, entityId?: string | null, metadata?: any): Promise<{
        userId: string | null;
        module: string;
        action: string;
        entityId: string | null;
        id: string;
        entityType: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    }>;
    findAll(query: AuditLogQueryDto): Promise<{
        items: {
            userId: string | null;
            module: string;
            action: string;
            entityId: string | null;
            id: string;
            entityType: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        userId: string | null;
        module: string;
        action: string;
        entityId: string | null;
        id: string;
        entityType: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
    } | null>;
}

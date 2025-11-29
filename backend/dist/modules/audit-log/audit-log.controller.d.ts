import { AuditLogService } from './audit-log.service';
import { AuditLogQueryDto } from './dto/audit-log-query.dto';
export declare class AuditLogController {
    private readonly service;
    constructor(service: AuditLogService);
    getAll(query: AuditLogQueryDto): Promise<{
        items: {
            id: string;
            userId: string | null;
            module: string;
            action: string;
            entityId: string | null;
            entityType: string | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getOne(id: string): Promise<{
        id: string;
        userId: string | null;
        module: string;
        action: string;
        entityId: string | null;
        entityType: string | null;
        metadata: import(".prisma/client").Prisma.JsonValue | null;
        createdAt: Date;
    } | null>;
}

import { AuditLogService } from '@/modules/audit-log/audit-log.service';
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly audit: AuditLogService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();

        // lấy user từ req.user (JWT)
        const user = req.user;
        const method = req.method;
        const url = req.url;

        const body = req.body;
        const params = req.params;
        const query = req.query;

        const ip = req.ip;
        const agent = req.headers['user-agent'];

        // module được lấy từ URL: /api/users → "users"
        const module = url.split('/')[2] || 'unknown';

        return next.handle().pipe(
            tap(async (response) => {
                if (!user) return;

                // KHÔNG LOG ADMIN
                if (user.role === 'ADMIN') return;

                // Optional: Không log login
                if (url.includes('/auth/login')) return;

                // Extract entityId from params, body, or response
                let entityId: string | null = null;
                
                // Try params first (e.g., /api/users/:id)
                if (params?.id) {
                    entityId = params.id;
                } else if (params && Object.keys(params).length > 0) {
                    // Try any param that looks like an ID
                    const idParam = Object.values(params).find((val: any) => 
                        typeof val === 'string' && (val.length === 24 || val.length === 36)
                    );
                    if (idParam) entityId = idParam as string;
                }
                
                // Try body.id (for create/update operations)
                if (!entityId && body?.id) {
                    entityId = body.id;
                }
                
                // Try response data (for create operations that return the entity)
                if (!entityId && response?.data?.id) {
                    entityId = response.data.id;
                } else if (!entityId && response?.id) {
                    entityId = response.id;
                }

                await this.audit.log(
                    user.id,
                    method,
                    module,
                    entityId,
                    {
                        url,
                        params,
                        query,
                        body,
                        ip,
                        agent
                    },
                    module // entityType defaults to module name
                );
            })
        );
    }
}

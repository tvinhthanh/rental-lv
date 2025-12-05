import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const auditLogService = {
    list: (params?: {
        userId?: string;
        module?: string;
        action?: string;
        entityId?: string;
        search?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        if (params?.userId) query.append("userId", params.userId);
        if (params?.module) query.append("module", params.module);
        if (params?.action) query.append("action", params.action);
        if (params?.entityId) query.append("entityId", params.entityId);
        if (params?.search) query.append("search", params.search);
        if (params?.from) query.append("from", params.from);
        if (params?.to) query.append("to", params.to);
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        
        const queryString = query.toString();
        return api.get(`/audit-logs${queryString ? `?${queryString}` : ""}`);
    },

    get: (id: string) => api.get(`/audit-logs/${id}`),
};


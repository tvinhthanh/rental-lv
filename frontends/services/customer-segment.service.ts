import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const customerSegmentService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/customer-segments${qs}`);
    },
    get: (id: string) => api.get(`/customer-segments/${id}`),
    create: (data: any) => api.post("/customer-segments", data),
    update: (id: string, data: any) => api.put(`/customer-segments/${id}`, data),
    delete: (id: string) => api.delete(`/customer-segments/${id}`),
};


import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const partnerService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/partners${qs}`);
    },
    get: (id: string) => api.get(`/partners/${id}`),
    getByCode: (code: string) => api.get(`/partners/code/${code}`),
    create: (data: any) => api.post("/partners", data),
    update: (id: string, data: any) => api.put(`/partners/${id}`, data),
    delete: (id: string) => api.delete(`/partners/${id}`),
};


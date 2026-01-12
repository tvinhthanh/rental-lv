import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const loyaltyProgramService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/loyalty-programs${qs}`);
    },
    get: (id: string) => api.get(`/loyalty-programs/${id}`),
    create: (data: any) => api.post("/loyalty-programs", data),
    update: (id: string, data: any) => api.put(`/loyalty-programs/${id}`, data),
    delete: (id: string) => api.delete(`/loyalty-programs/${id}`),
};


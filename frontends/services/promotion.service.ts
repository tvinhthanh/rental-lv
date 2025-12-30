import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const promotionService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/promotions${qs}`);
    },
    get: (id: string) => api.get(`/promotions/${id}`),
    create: (data: any) => api.post("/promotions", data),
    update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
    delete: (id: string) => api.delete(`/promotions/${id}`),
};

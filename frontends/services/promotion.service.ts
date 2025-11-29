import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const promotionService = {
    list: () => api.get("/promotions"),
    get: (id: string) => api.get(`/promotions/${id}`),
    create: (data: any) => api.post("/promotions", data),
    update: (id: string, data: any) => api.put(`/promotions/${id}`, data),
    delete: (id: string) => api.delete(`/promotions/${id}`),
};

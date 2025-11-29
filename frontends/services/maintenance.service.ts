import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const maintenanceService = {
    list: () => api.get("/maintenance"),
    get: (id: string) => api.get(`/maintenance/${id}`),
    create: (data: any) => api.post("/maintenance", data),
    update: (id: string, data: any) => api.put(`/maintenance/${id}`, data),
    delete: (id: string) => api.delete(`/maintenance/${id}`),
};

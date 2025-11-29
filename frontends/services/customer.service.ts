import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const customerService = {
    getAll() {
        return api.get(`/customers`);
    },
    get: (id: string) => api.get(`/customers/${id}`),
    create: (data: any) => api.post("/customers", data),
    update: (id: string, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
    getByUserId: (userId: string) => api.get(`/customers/user/${userId}`),
};

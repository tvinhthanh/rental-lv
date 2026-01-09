import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const customerService = {
    getAll(params?: Record<string, any>) {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/customers${qs}`);
    },
    get: (id: string) => api.get(`/customers/${id}`),
    create: (data: any) => api.post("/customers", data),
    update: (id: string, data: any) => api.put(`/customers/${id}`, data),
    delete: (id: string) => api.delete(`/customers/${id}`),
    getByUserId: (userId: string) => api.get(`/customers/user/${userId}`),
    upgradeMembership: (id: string, membershipTier: string) => 
        api.patch(`/customers/${id}/membership`, { membershipTier }),
};

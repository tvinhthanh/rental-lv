import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const vehicleService = {
    getAll(params?: Record<string, any>) {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/vehicles${qs}`);
    },

    get(id: string) {
        return api.get(`/vehicles/${id}`);
    },

    create(data: any) {
        return api.post(`/vehicles`, data);
    },

    update(id: string, data: any) {
        return api.put(`/vehicles/${id}`, data);
    },

    delete(id: string) {
        return api.delete(`/vehicles/${id}`);
    },

    getBySlug(slug: string) {
        return api.get(`/vehicles/slug/${slug}`);
    },

    getByBranch(branchId: string) {
        return api.get(`/vehicles/branch/${branchId}`);
    }
};

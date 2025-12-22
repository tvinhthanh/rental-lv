import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const vehicleService = {
    getAll(params?: Record<string, any>) {
        if (!params) return api.get(`/vehicles`);
        
        // Filter out undefined/null values và build query string
        const cleanParams: Record<string, string> = {};
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                cleanParams[key] = String(value);
            }
        });
        
        const qs = Object.keys(cleanParams).length > 0 
            ? `?${new URLSearchParams(cleanParams).toString()}` 
            : "";
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

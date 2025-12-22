import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const documentService = {
    list: (params?: { vehicleId?: string; docType?: string; page?: number; limit?: number }) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/vehicle-documents${qs}`);
    },

    get: (id: string) =>
        api.get(`/vehicle-documents/${id}`),

    create: (data: any) =>
        api.post(`/vehicle-documents`, data),

    update: (id: string, data: any) =>
        api.put(`/vehicle-documents/${id}`, data),

    delete: (id: string) =>
        api.delete(`/vehicle-documents/${id}`),
};

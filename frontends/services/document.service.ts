import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const documentService = {
    list: (vehicleId: string) =>
        api.get(`/vehicle-documents/${vehicleId}`),

    create: (vehicleId: string, data: any) =>
        api.post(`/vehicle-documents/${vehicleId}`, data),

    delete: (id: string) =>
        api.delete(`/vehicle-documents/${id}`),
};

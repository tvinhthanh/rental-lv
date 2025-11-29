import { APIRequest } from "@/lib/api";
const api = new APIRequest();
export const vehicleCategoryService = {
    list(keyword?: string) {
        const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
        return api.get(`/vehicle-categories${qs}`);
    },

    create(data: any) {
        return api.post("/vehicle-categories", data);
    },

    update(id: string, data: any) {
        return api.put(`/vehicle-categories/${id}`, data);
    },

    delete(id: string) {
        return api.delete(`/vehicle-categories/${id}`);
    },
};

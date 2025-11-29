import { APIRequest } from "@/lib/api";
const api = new APIRequest();
export const vehicleCategoryService = {
    list() {
        return api.get(`/vehicle-categories`);
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

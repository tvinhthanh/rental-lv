import api from "@/lib/api";

export const vehicleCategoryService = {
    getAll(keyword?: string) {
        return api
            .get("/vehicle-categories", { params: { keyword } })
            .then((r: { data: any; }) => r.data);
    },

    create(data: any) {
        return api.post("/vehicle-categories", data).then((r: { data: any; }) => r.data);
    },

    update(id: string, data: any) {
        return api.put(`/vehicle-categories/${id}`, data).then((r: { data: any; }) => r.data);
    },

    delete(id: string) {
        return api.delete(`/vehicle-categories/${id}`).then((r: { data: any; }) => r.data);
    },
};

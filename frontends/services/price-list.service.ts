import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const priceListService = {
    getAll() {
        return api.get(`/price-lists`);
    },

    getOne(id: string) {
        return api.get(`/price-lists/${id}`);
    },

    create(data: any) {
        return api.post(`/price-lists`, data);
    },

    update(id: string, data: any) {
        return api.put(`/price-lists/${id}`, data);
    },

    delete(id: string) {
        return api.delete(`/price-lists/${id}`);
    }
};

// src/services/brand.service.ts
import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const brandService = {
    // GET /brands
    getAll() {
        return api.get(`/brands`);
    },

    // GET /brands/:id
    get(id: string) {
        return api.get(`/brands/${id}`);
    },

    // POST /brands
    create(data: any) {
        return api.post("/brands", data);
    },

    // PUT /brands/:id
    update(id: string, data: any) {
        return api.put(`/brands/${id}`, data);
    },

    // PATCH /brands/:id/deactivate
    deactivate(id: string) {
        return api.put(`/brands/${id}/deactivate`);
    },

    // DELETE /brands/:id
    delete(id: string) {
        return api.delete(`/brands/${id}`);
    }
};

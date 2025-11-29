// src/services/brand.service.ts
import api from "@/lib/api";

export const brandService = {
    // GET /brands?keyword=...
    async getAll(keyword?: string) {
        const res = await api.get("/brands", { params: { keyword } });
        return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
    },

    // GET /brands/:id
    get(id: string) {
        return api.get(`/brands/${id}`).then(r => r.data);
    },

    // POST /brands
    create(data: any) {
        return api.post("/brands", data).then(r => r.data);
    },

    // PUT /brands/:id
    update(id: string, data: any) {
        return api.put(`/brands/${id}`, data).then(r => r.data);
    },

    // PATCH /brands/:id/deactivate
    deactivate(id: string) {
        return api.patch(`/brands/${id}/deactivate`).then(r => r.data);
    },

    // DELETE /brands/:id
    delete(id: string) {
        return api.delete(`/brands/${id}`).then(r => r.data);
    }
};

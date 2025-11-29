// src/services/vehicle.service.ts
import api from "@/lib/api";

export const vehicleService = {
    // GET /vehicles?search=...
    async getAll(keyword?: string) {
        const res = await api.get("/vehicles", { params: { search: keyword } });
        return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
    },

    // GET /vehicles/:id
    get(id: string) {
        return api.get(`/vehicles/${id}`).then(r => r.data);
    },

    // POST /vehicles
    create(data: any) {
        return api.post("/vehicles", data).then(r => r.data);
    },

    // PUT /vehicles/:id
    update(id: string, data: any) {
        return api.put(`/vehicles/${id}`, data).then(r => r.data);
    },

    // DELETE /vehicles/:id
    delete(id: string) {
        return api.delete(`/vehicles/${id}`).then(r => r.data);
    }
};

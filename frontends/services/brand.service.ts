// src/services/brand.service.ts
import { APIRequest } from "@/lib/api";
const api = new APIRequest();

const buildQuery = (params?: Record<string, any>) => {
    if (!params) return "";
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}` !== "") {
            qp.append(k, `${v}`);
        }
    });
    const s = qp.toString();
    return s ? `?${s}` : "";
};

export const brandService = {
    // GET /brands
    getAll(params?: Record<string, any>) {
        const query = buildQuery(params);
        return api.get(`/brands${query}`);
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

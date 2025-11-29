import api from "@/lib/api";

export const branchService = {
    // GET /branches?keyword=...
    async getAll(keyword?: string) {
        const res = await api.get("/branches", { params: { keyword } });
        return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
    },

    // GET /branches/:id
    get(id: string) {
        return api.get(`/branches/${id}`).then(r => r.data);
    },

    // POST /branches
    create(data: any) {
        return api.post("/branches", data).then(r => r.data);
    },

    // PUT /branches/:id  → đúng với backend update()
    update(id: string, data: any) {
        return api.put(`/branches/${id}`, data).then(r => r.data);
    },

    // PATCH /branches/:id/deactivate  → đúng backend deactivate()
    deactivate(id: string) {
        return api.patch(`/branches/${id}/deactivate`).then(r => r.data);
    },

    // DELETE /branches/:id  → đúng backend delete()
    delete(id: string) {
        return api.delete(`/branches/${id}`).then(r => r.data);
    }
};

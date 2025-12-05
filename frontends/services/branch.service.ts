import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const branchService = {
    // GET /branches
    getAll(params?: Record<string, any>) {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/branches${qs}`);
    },

    // GET /branches/:id
    get(id: string) {
        return api.get(`/branches/${id}`);
    },

    // POST /branches
    create(data: any) {
        return api.post("/branches", data);
    },

    // PUT /branches/:id  → đúng với backend update()
    update(id: string, data: any) {
        return api.put(`/branches/${id}`, data);
    },

    // PATCH /branches/:id/deactivate  → đúng backend deactivate()
    deactivate(id: string) {
        return api.put(`/branches/${id}/deactivate`);
    },

    // DELETE /branches/:id  → đúng backend delete()
    delete(id: string) {
        return api.delete(`/branches/${id}`);
    },

};

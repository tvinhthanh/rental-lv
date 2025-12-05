import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const settingsService = {
    getAll: () => api.get("/settings"),
    getPublic: async () => {
        try {
            return await api.get("/settings/public"); // No auth required
        } catch (err: any) {
            // ⚡ Nếu endpoint không tồn tại (404), trả về null thay vì throw error
            if (err?.response?.status === 404 || err?.status === 404) {
                console.warn("Settings public endpoint not found (404). Backend may need restart.");
                return null;
            }
            throw err;
        }
    },
    update: (data: any) => api.put("/settings", data),
    getByKey: (key: string) => api.get(`/settings/key/${key}`),
};

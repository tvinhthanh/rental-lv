import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const settingsService = {
    getAll: () => api.get("/settings"),
    getPublic: () => api.get("/settings/public"), // No auth required
    update: (data: any) => api.put("/settings", data),
    getByKey: (key: string) => api.get(`/settings/key/${key}`),
};


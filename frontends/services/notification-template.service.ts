import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const notificationTemplateService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/notification-templates${qs}`);
    },
    get: (id: string) => api.get(`/notification-templates/${id}`),
    getByCode: (code: string) => api.get(`/notification-templates/code/${code}`),
    create: (data: any) => api.post("/notification-templates", data),
    update: (id: string, data: any) => api.put(`/notification-templates/${id}`, data),
    delete: (id: string) => api.delete(`/notification-templates/${id}`),
};


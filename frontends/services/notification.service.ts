import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const notificationService = {
    list: (params?: Record<string, any>) => {
        if (!params) return api.get("/notifications");
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => v != null && searchParams.append(k, String(v)));
        return api.get(`/notifications?${searchParams.toString()}`);
    },
    get: (id: string) => api.get(`/notifications/${id}`),
    create: (data: any) => api.post("/notifications", data),
    markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put("/notifications/mark-all-read"),
    getUnreadCount: () => api.get("/notifications/unread-count"),
    delete: (id: string) => api.delete(`/notifications/${id}`),
};


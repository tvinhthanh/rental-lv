import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const reviewService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/reviews${qs}`);
    },
    get: (id: string) => api.get(`/reviews/${id}`),
    create: (data: any) => api.post("/reviews", data),
};

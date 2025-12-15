import { APIRequest } from "@/lib/api";

const api = new APIRequest();

export const reviewService = {
    list: (params?: Record<string, any>) => {
        if (!params || Object.keys(params).length === 0) {
            return api.get("/reviews");
        }

        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            searchParams.append(key, String(value));
        });

        const query = searchParams.toString();
        return api.get(`/reviews?${query}`);
    },
    get: (id: string) => api.get(`/reviews/${id}`),
    create: (data: any) => api.post("/reviews", data),
};

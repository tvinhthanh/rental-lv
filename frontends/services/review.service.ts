import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const reviewService = {
    list: () => api.get("/reviews"),
    get: (id: string) => api.get(`/reviews/${id}`),
    create: (data: any) => api.post("/reviews", data),
};

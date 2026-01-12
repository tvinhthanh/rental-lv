import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const pricingRuleService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/pricing-rules${qs}`);
    },
    get: (id: string) => api.get(`/pricing-rules/${id}`),
    create: (data: any) => api.post("/pricing-rules", data),
    update: (id: string, data: any) => api.put(`/pricing-rules/${id}`, data),
    delete: (id: string) => api.delete(`/pricing-rules/${id}`),
};


import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const marketingCampaignService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/marketing-campaigns${qs}`);
    },
    get: (id: string) => api.get(`/marketing-campaigns/${id}`),
    create: (data: any) => api.post("/marketing-campaigns", data),
    update: (id: string, data: any) => api.put(`/marketing-campaigns/${id}`, data),
    delete: (id: string) => api.delete(`/marketing-campaigns/${id}`),
};


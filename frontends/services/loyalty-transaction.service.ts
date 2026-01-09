import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const loyaltyTransactionService = {
    list: (params?: Record<string, any>) => {
        const qs = params ? `?${new URLSearchParams(params as any).toString()}` : "";
        return api.get(`/loyalty-transactions${qs}`);
    },
    get: (id: string) => api.get(`/loyalty-transactions/${id}`),
    create: (data: any) => api.post("/loyalty-transactions", data),
};


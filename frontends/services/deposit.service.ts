import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const depositService = {
    get: (bookingId: string) =>
        api.get(`/deposit/${bookingId}`),

    create: (data: any) =>
        api.post("/deposit", data),

    addDetail: (data: any) =>
        api.post("/deposit/detail", data),

    details: (depositId: string) =>
        api.get(`/deposit/detail/${depositId}`),
};

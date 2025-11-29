import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const rentalProcessService = {
    contract: (bookingId: string) =>
        api.get(`/contract/${bookingId}`),

    createContract: (data: any) =>
        api.post("/contract", data),

    handover: (bookingId: string) =>
        api.get(`/handover/${bookingId}`),

    createHandover: (data: any) =>
        api.post("/handover", data),

    returnReport: (bookingId: string) =>
        api.get(`/return-report/${bookingId}`),

    createReturnReport: (data: any) =>
        api.post("/return-report", data),
};

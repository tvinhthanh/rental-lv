import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const rentalProcessService = {
    // Contract theo booking
    contract: (bookingId: string) =>
        api.get(`/contracts/booking/${bookingId}`),

    createContract: (data: any) =>
        api.post("/contracts", data),

    contractsByBranch: (branchId: string) =>
        api.get(`/contracts/branch/${branchId}`),

    handover: (bookingId: string) =>
        api.get(`/handover/${bookingId}`),

    createHandover: (data: any) =>
        api.post("/handover", data),

    handoversByBranch: (branchId: string) =>
        api.get(`/handover/branch/${branchId}`),

    returnReport: (bookingId: string) =>
        api.get(`/return-report/${bookingId}`),

    createReturnReport: (data: any) =>
        api.post("/return-report", data),

    returnsByBranch: (branchId: string) =>
        api.get(`/return-report/branch/${branchId}`),
};

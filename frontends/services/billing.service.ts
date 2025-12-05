import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const billingService = {
    invoices: () => api.get("/billing/invoices"),
    invoice: (id: string) => api.get(`/billing/invoices/${id}`),
    createInvoice: (data: any) => api.post("/billing/invoices", data),

    invoicesByBranch: (branchId: string) =>
        api.get(`/billing/invoices/branch/${branchId}`),

    pay: (data: any) => api.post("/billing/payments", data),
    payments: (invoiceId: string) =>
        api.get(`/billing/payments/${invoiceId}`),

    addSurcharge: (data: any) =>
        api.post("/billing/surcharges", data),

    surcharges: (invoiceId: string) =>
        api.get(`/billing/surcharges/${invoiceId}`),
    
    allSurcharges: () =>
        api.get("/billing/surcharges"),
    
    surchargesByBranch: (branchId: string) =>
        api.get(`/billing/surcharges/branch/${branchId}`),
};

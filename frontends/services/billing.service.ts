import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const billingService = {
    invoices: () => api.get("/billing/invoices").then(r => r.data),
    invoice: (id: string) => api.get(`/billing/invoices/${id}`).then(r => r.data),
    createInvoice: (data: any) => api.post("/billing/invoices", data).then(r => r.data),

    pay: (data: any) => api.post("/billing/payments", data).then(r => r.data),
    payments: (invoiceId: string) =>
        api.get(`/billing/payments/${invoiceId}`).then(r => r.data),

    addSurcharge: (data: any) =>
        api.post("/billing/surcharges", data).then(r => r.data),

    surcharges: (invoiceId: string) =>
        api.get(`/billing/surcharges/${invoiceId}`).then(r => r.data),
};

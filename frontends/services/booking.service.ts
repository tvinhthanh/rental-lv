import { APIRequest } from "@/lib/api";
const api = new APIRequest();



export const bookingService = {
    // Cho phép truyền query (customerId/status/branchId/page/limit...)
    list: (params?: Record<string, any>) => {
        const qs = new URLSearchParams();
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                if (v !== undefined && v !== null && v !== "") {
                    qs.append(k, String(v));
                }
            });
        }
        const suffix = qs.toString() ? `?${qs.toString()}` : "";
        return api.get(`/bookings${suffix}`);
    },
    // API trả thẳng object booking (kèm customer, vehicle, branch,...)
    get: (id: string) => api.get(`/bookings/${id}`),
    create: (data: any) => api.post("/bookings", data).then(r => r.data),
    updateStatus: (id: string, status: string) =>
        api.put(`/bookings/${id}/status/${status}`).then(r => r.data),
    getDateAvailable: (vehicleId: string) => api.get(`/bookings/cars/${vehicleId}`).then(r => r.data),
    async getByBranch(branchId: string) {
        const res = await api.get(`/bookings/branch/${branchId}`);
        return res;
    }
};

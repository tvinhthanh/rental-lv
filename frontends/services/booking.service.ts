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
    create: async (data: any) => {
        const res = await api.post("/bookings", data);
        // ⚡ API trả về trực tiếp booking object hoặc có thể wrap trong .data
        return res?.data || res;
    },
    updateStatus: (id: string, status: string) =>
        api.put(`/bookings/${id}/status/${status}`).then(r => r.data),
    getDateAvailable: (vehicleId: string) => api.get(`/bookings/cars/${vehicleId}`).then(r => r.data),
    async getByBranch(branchId: string) {
        const res = await api.get(`/bookings/branch/${branchId}`);
        return res;
    }
};

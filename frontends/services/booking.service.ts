import { APIRequest } from "@/lib/api";
const api = new APIRequest();



export const bookingService = {
    // no using params, use query string
    // NOTE:
    // APIRequest already returns parsed JSON body.
    // The /bookings endpoint itself returns the paging object
    // (items, total, page, limit, totalPages, ...) at the top level.
    // So we should NOT access .data here, otherwise res will be undefined.
    list: () => api.get(`/bookings`),
    // API trả thẳng object booking (kèm customer, vehicle, branch,...),
    // APIRequest đã parse JSON nên không cần .data
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

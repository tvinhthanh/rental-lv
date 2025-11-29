import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const bookingService = {
    list: () => api.get("/bookings").then(r => r.data),
    get: (id: string) => api.get(`/bookings/${id}`).then(r => r.data),
    create: (data: any) => api.post("/bookings", data).then(r => r.data),
    updateStatus: (id: string, status: string) =>
        api.put(`/bookings/${id}/status/${status}`).then(r => r.data),
    getDateAvailable: (vehicleId: string) => api.get(`/bookings/cars/${vehicleId}`).then(r => r.data),
    getByBranch: (branchId: string) => api.get(`/bookings/branch/${branchId}`).then(r => r.data),
};  

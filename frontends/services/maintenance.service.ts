import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const maintenanceService = {
    // Lấy tất cả (optional filter vehicleId)
    list: (vehicleId?: string) =>
        api.get(`/maintenance${vehicleId ? `?vehicleId=${vehicleId}` : ""}`)
            .then(r => r.data),

    // Chi tiết 1 maintenance
    get: (id: string) =>
        api.get(`/maintenance/${id}`).then(r => r.data),

    // Tạo mới
    create: (data: any) =>
        api.post(`/maintenance`, data).then(r => r.data),

    // Update
    update: (id: string, data: any) =>
        api.put(`/maintenance/${id}`, data).then(r => r.data),

    // Xóa
    delete: (id: string) =>
        api.delete(`/maintenance/${id}`).then(r => r.data),

    // Lấy theo chi nhánh
    getByBranch: (branchId: string) =>
        api.get(`/maintenance/branch/${branchId}`).then(r => r.data),

    // Lấy theo status + branch
    getByStatus: (branchId: string, status: string) =>
        api.get(`/maintenance/status/${branchId}?status=${status}`).then(r => r.data),

    // Lấy theo vehicle
    getByVehicle: (vehicleId: string) =>
        api.get(`/maintenance/vehicle/${vehicleId}`).then(r => r.data),

    // Hoàn thành maintenance
    complete: (id: string) =>
        api.patch(`/maintenance/${id}/complete`).then(r => r.data),
};

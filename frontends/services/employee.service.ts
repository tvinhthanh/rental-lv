import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const employeeService = {
    getAll(keyword?: string) {
        const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
        return api.get(`/employees${qs}`);
    },

    get: (id: string) =>
        api.get(`/employees/${id}`),

    create: (data: any) =>
        api.post("/employees", data),

    update: (id: string, data: any) =>
        api.put(`/employees/${id}`, data),

    delete: (id: string) =>
        api.delete(`/employees/${id}`),
};

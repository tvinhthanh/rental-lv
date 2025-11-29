import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const userService = {
    list(keyword?: string) {
        const qs = keyword ? `?keyword=${encodeURIComponent(keyword)}` : "";
        return api.get(`/users${qs}`);
    },
    me: () => api.get("/auth/me"),
    get: (id: string) => api.get(`/users/${id}`),
    create: (data: any) => api.post("/users", data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data),
    delete: (id: string) => api.delete(`/users/${id}`),
    resetPassword: (data: any) => api.post("/users/reset-password", data),
};

export const employeeService = {
    list: () => api.get("/employees"),
    get: (id: string) => api.get(`/employees/${id}`),
    create: (data: any) => api.post("/employees", data),
    update: (id: string, data: any) => api.put(`/employees/${id}`, data),
    delete: (id: string) => api.delete(`/employees/${id}`),
};

import api from "@/lib/api";

export const userService = {
    list: (search?: string) =>
        api.get("/users", { params: { search } }).then((r) => r.data),
    me: () => api.get("/auth/me").then((r) => r.data),
    get: (id: string) => api.get(`/users/${id}`).then((r) => r.data),
    create: (data: any) => api.post("/users", data).then((r) => r.data),
    update: (id: string, data: any) => api.put(`/users/${id}`, data).then((r) => r.data),
    delete: (id: string) => api.delete(`/users/${id}`).then((r) => r.data),
    resetPassword: (data: any) => api.post("/users/reset-password", data).then((r) => r.data),
};

export const employeeService = {
    list: () => api.get("/employees").then(r => r.data),
    get: (id: string) => api.get(`/employees/${id}`).then(r => r.data),
    create: (data: any) => api.post("/employees", data).then(r => r.data),
    update: (id: string, data: any) => api.patch(`/employees/${id}`, data).then(r => r.data),
    delete: (id: string) => api.delete(`/employees/${id}`).then(r => r.data),
};

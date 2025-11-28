// src/services/employee.service.ts
import api from "@/lib/api";

export const employeeService = {
    list: (params?: any) =>
        api.get("/employees", { params }).then(r => r.data),

    get: (id: string) =>
        api.get(`/employees/${id}`).then(r => r.data),

    create: (data: any) =>
        api.post("/employees", data).then(r => r.data),

    update: (id: string, data: any) =>
        api.put(`/employees/${id}`, data).then(r => r.data),

    delete: (id: string) =>
        api.delete(`/employees/${id}`).then(r => r.data),
};

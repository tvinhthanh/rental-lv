import { APIRequest } from "@/lib/api";
const api = new APIRequest();

const buildQuery = (params?: Record<string, any>) => {
    if (!params) return "";
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}` !== "") {
            qp.append(k, `${v}`);
        }
    });
    const s = qp.toString();
    return s ? `?${s}` : "";
};

export const employeeService = {
    getAll(params?: any) {
        const query = buildQuery(params);
        return api.get(`/employees${query}`);
    },

    list: (params?: any) => {
        const query = buildQuery(params);
        return api.get(`/employees${query}`);
    },

    get: (id: string) =>
        api.get(`/employees/${id}`),

    create: (data: any) =>
        api.post("/employees", data),

    update: (id: string, data: any) =>
        api.put(`/employees/${id}`, data),

    delete: (id: string) =>
        api.delete(`/employees/${id}`),

    getUser: (id: string) =>
        api.get(`/employees/user/${id}`),
};

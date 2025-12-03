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

export const vehicleCategoryService = {
    list(params?: Record<string, any>) {
        const query = buildQuery(params);
        return api.get(`/vehicle-categories${query}`);
    },

    create(data: any) {
        return api.post("/vehicle-categories", data);
    },

    update(id: string, data: any) {
        return api.put(`/vehicle-categories/${id}`, data);
    },

    delete(id: string) {
        return api.delete(`/vehicle-categories/${id}`);
    },
};

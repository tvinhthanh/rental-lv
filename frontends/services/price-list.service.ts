import api from "@/lib/api";

export const priceListService = {
    // GET ALL (with optional search)
    getAll(keyword?: string) {
        return api
            .get("/price-lists/", { params: { keyword } })
            .then((res) => res.data);
    },

    // GET ONE
    getOne(id: string) {
        return api.get(`/price-lists/${id}`).then((res) => res.data);
    },

    // CREATE
    create(data: any) {
        return api.post("/price-lists", data).then((res) => res.data);
    },

    // UPDATE
    update(id: string, data: any) {
        return api.put(`/price-lists/${id}`, data).then((res) => res.data);
    },

    // DELETE
    delete(id: string) {
        return api.delete(`/price-lists/${id}`).then((res) => res.data);
    },
};

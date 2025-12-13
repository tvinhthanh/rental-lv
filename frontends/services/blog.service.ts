import { APIRequest } from "@/lib/api";
const api = new APIRequest();

const buildQuery = (params?: Record<string, any>) => {
    if (!params) return "";
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
            qs.append(k, String(v));
        }
    });
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return suffix;
};

export const blogService = {
    listCategories: (params?: Record<string, any>) => api.get(`/blog/categories${buildQuery(params)}`),
    getCategory: (id: string) => api.get(`/blog/categories/${id}`),
    createCategory: (data: any) => api.post("/blog/categories", data),
    updateCategory: (id: string, data: any) => api.put(`/blog/categories/${id}`, data),
    deleteCategory: (id: string) => api.delete(`/blog/categories/${id}`),

    listPosts: (params?: Record<string, any>) => api.get(`/blog/posts${buildQuery(params)}`),
    getPost: (id: string) => api.get(`/blog/posts/${id}`),
    createPost: (data: any) => api.post("/blog/posts", data),
    updatePost: (id: string, data: any) => api.put(`/blog/posts/${id}`, data),
    deletePost: (id: string) => api.delete(`/blog/posts/${id}`),
};

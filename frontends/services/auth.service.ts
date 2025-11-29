import { APIRequest } from "@/lib/api";
const api = new APIRequest();

export const authService = {
    async login(data: any) {
        const res = await api.post("/auth/login", data);

        const token = res.accessToken;        // ✔ Đúng cấu trúc API
        const role = res.user?.role;

        if (typeof window !== "undefined" && token) {
            // Lưu token
            localStorage.setItem("accessToken", token);
            document.cookie = `accessToken=${token}; path=/; max-age=604800`;
        }

        if (typeof window !== "undefined" && role) {
            // Lưu role
            localStorage.setItem("role", role);
            document.cookie = `role=${role}; path=/; max-age=604800`;
        }

        return res;    // ✔ Không return res.data nữa
    },

    logout() {
        if (typeof window !== "undefined") {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("role");

            // Xoá cookie
            document.cookie = `accessToken=; path=/; max-age=0`;
            document.cookie = `role=; path=/; max-age=0`;
        }
    },

    getToken() {
        if (typeof window !== "undefined") {
            return localStorage.getItem("accessToken");
        }
        return null;
    },

    isAuthenticated() {
        if (typeof window !== "undefined") {
            return !!localStorage.getItem("accessToken");
        }
        return false;
    },

    register(data: any) {
        return api.post("/auth/register", data);
    },

    forgotPassword(data: any) {
        return api.post("/auth/forgot-password", data);
    },
    createEmployee: (data: any) => api.post("/auth/create-employee", data),
};

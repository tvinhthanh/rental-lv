"use client";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { APIRequest } from "@/lib/api";
const api = new APIRequest();
export function useProfile() {
    const {
        data: user,
        isLoading: userLoading,
        error: userError
    } = useCurrentUser();

    const refId =
        user && user.role !== "ADMIN"
            ? user.customerId || user.employeeId
            : null;

    const endpoint =
        user?.role === "CUSTOMER"
            ? `/customers/${refId}`
            : user?.role === "EMPLOYEE"
                ? `/employees/${refId}`
                : null;

    const {
        data: profile,
        isLoading: profileLoading,
        error: profileError
    } = useQuery({
        queryKey: ["profile", endpoint],
        enabled: !!endpoint,        // chỉ fetch khi có endpoint hợp lệ
        queryFn: async () => {
            if (!endpoint) return null;
            const res = await api.get(endpoint);
            return res.data;
        }
    });

    return {
        user,
        profile,
        isLoading: userLoading || profileLoading,
        isError: userError || profileError
    };
}

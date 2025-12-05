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

    // ⚡ Xử lý cả role USER và CUSTOMER để fetch customer
    const endpoint =
        user?.role === "CUSTOMER" && refId
            ? `/customers/${refId}`
            : user?.role === "USER"
                ? `/customers/user/${user.id}` // Fetch customer by userId
                : user?.role === "EMPLOYEE" && refId
                ? `/employees/${refId}`
                : null;

    const {
        data: profile,
        isLoading: profileLoading,
        error: profileError
    } = useQuery({
        queryKey: ["profile", endpoint],
        enabled: !!endpoint,
        queryFn: async () => {
            if (!endpoint) return null;
            const res = await api.get(endpoint);
            return res?.data ?? res;
        }
    });

    return {
        user,
        profile,
        isLoading: userLoading || profileLoading,
        isError: userError || profileError
    };
}

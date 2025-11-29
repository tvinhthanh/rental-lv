"use client";

import useSWR from "swr";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import api from "@/lib/api";

const fetcher = (url: string) => api.get(url).then(r => r.data);

export function useProfile() {
    const { data: user, isLoading: userLoading, error: userError } = useCurrentUser();

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
        error: profileError,
        isLoading: profileLoading
    } = useSWR(endpoint, fetcher);

    return {
        user,
        profile,
        isLoading: userLoading || profileLoading,
        isError: userError || profileError
    };
}

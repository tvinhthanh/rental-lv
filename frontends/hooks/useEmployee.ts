"use client";

import { useQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useEmployee() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const {
        data: employee,
        isLoading: employeeLoading,
        error: employeeError,
    } = useQuery({
        queryKey: ["employee", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
                const res = await employeeService.getUser(user.id);
            // Normalize response
            return res?.data ?? res ?? null;
        },
        enabled: !!user && user.role === "EMPLOYEE" && !userLoading,
        retry: false,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        employee: employee ?? null,
        loading: userLoading || employeeLoading,
        error: employeeError ? "Không thể tải thông tin nhân viên" : null,
        isEmployee: user?.role === "EMPLOYEE",
    };
}

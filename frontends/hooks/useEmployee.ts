"use client";

import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function useEmployee() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (userLoading) return;

        if (!user || user.role !== "EMPLOYEE") {
            setEmployee(null);
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const res = await employeeService.getUser(user.id);

                /**
                 * ✔ Chuẩn normalize:
                 * - API trả object → res.data
                 * - Trả thẳng → res
                 */
                const data = res?.data ?? res ?? null;

                setEmployee(data);
            } catch (err) {
                console.error("useEmployee failed:", err);
                setError("Không thể tải thông tin nhân viên");
            } finally {
                setLoading(false);
            }
        })();
    }, [user, userLoading]);

    return {
        employee,
        loading,
        error,
        isEmployee: user?.role === "EMPLOYEE",
    };
}

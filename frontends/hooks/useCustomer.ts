"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { customerService } from "@/services/customer.service";

export function useCustomer() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [customer, setCustomer] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        if (userLoading) return;

        // Không đăng nhập → không có customer
        if (!user) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                let res;

                // --- CASE 1: USER ROLE = CUSTOMER ---
                if (user.role === "CUSTOMER" && user.customerId) {
                    res = await customerService.get(user.customerId);
                }

                // --- CASE 2: USER ROLE = USER ---
                else if (user.role === "USER") {
                    res = await customerService.getByUserId(user.id);
                }

                // --- ADMIN / EMPLOYEE → không có hồ sơ khách hàng ---
                else {
                    setCustomer(null);
                    setLoading(false);
                    return;
                }

                const data = res?.data || res;
                setCustomer(data);

            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        }

        load();

    }, [user, userLoading]);

    return {
        customer,
        loading: loading || userLoading,
        error
    };
}

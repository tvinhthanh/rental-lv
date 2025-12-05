"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminIndexPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUser();

    useEffect(() => {
        if (!userLoading && (!user || user.role !== "ADMIN")) {
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
            if (!token) {
                router.replace("/auth");
            } else {
                router.replace("/404");
            }
        }
    }, [user, userLoading, router]);

    if (userLoading || !user || user.role !== "ADMIN") {
        return null;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-300 mt-2">
                Welcome back, admin. Here is your control panel.
            </p>
        </div>
    );
}

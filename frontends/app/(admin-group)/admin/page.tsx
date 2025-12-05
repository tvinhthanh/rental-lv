"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminIndexPage() {
    const router = useRouter();
    const { data: user, isLoading: userLoading } = useCurrentUser();

    useEffect(() => {
        if (!userLoading) {
            if (user && user.role === "ADMIN") {
                router.replace("/admin/dashboard");
            } else {
                const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
                if (!token) {
                    router.replace("/auth");
                } else {
                    router.replace("/404");
                }
            }
        }
    }, [user, userLoading, router]);

    return null;
}

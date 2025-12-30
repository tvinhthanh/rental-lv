"use client";

import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname !== "/user") router.replace("/user");
      return;
    }

    if (user.role === "ADMIN") {
      if (!pathname.startsWith("/admin")) router.replace("/admin/dashboard");
      return;
    }

    if (user.role === "EMPLOYEE") {
      if (pathname !== "/employee") router.replace("/employee");
      return;
    }

    if (pathname !== "/user") {
      router.replace("/user");
    }

  }, [loading, user, pathname, router]);

  return null;
}

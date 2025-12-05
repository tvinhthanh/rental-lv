"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/common/sidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useCurrentUser();
  const [isChecking, setIsChecking] = useState(true);

  // Check authentication and role
  useEffect(() => {
    if (!userLoading) {
      setIsChecking(false);

      if (!user || user.role !== "ADMIN") {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) {
          router.replace("/auth");
        } else {
          router.replace("/404");
        }
      }
    }
  }, [user, userLoading, router]);

  if (userLoading || isChecking) {
    return (
      <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
          <p className="text-gray-400">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-900 text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-6 pt-16 lg:pt-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { Sidebar } from "@/components/common/sidebar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar />
            <div className="flex-1 flex flex-col lg:ml-0">
                <main className="p-3 sm:p-4 md:p-6 lg:p-6 pt-16 lg:pt-6">{children}</main>
            </div>
        </div>
    );
}

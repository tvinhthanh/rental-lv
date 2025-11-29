"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLE_MENU_HEADER } from "@/lib/role-menu";
import { useState } from "react";

export default function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const menu =
        user?.role && ROLE_MENU_HEADER[user.role as keyof typeof ROLE_MENU_HEADER]
            ? ROLE_MENU_HEADER[user.role as keyof typeof ROLE_MENU_HEADER]
            : [];

    const handleLogout = () => {
        logout(); // Logout sẽ trigger re-render ngay
        toast.success("Logged out");
        router.push("/auth");
        router.refresh(); // Force refresh để chắc chắn
    };

    const handleProfile = () => {
        if (user?.role === "CUSTOMER") {
            router.push("/user/profile");
        } else if (user?.role === "EMPLOYEE") {
            router.push("/employee/profile");
        } else if (user?.role === "ADMIN") {
            router.push("/admin/profile");
        }
    };
    return (
        <header className="relative w-full px-6 py-4">
            {/* BG Blur */}
            <div className="absolute" />

            {/* Container */}
            <div
                className="
        relative z-10
        max-w-7xl mx-auto
        flex items-center justify-between
      "
            >
                {/* LOGO */}
                <Link
                    href="/"
                    className="
            font-bold text-xl 
            bg-gradient-to-r from-indigo-300 to-cyan-300 
            bg-clip-text text-transparent
          "
                >
                    RENTAL SYSTEM
                </Link>

                {/* ROLE MENU */}
                {isAuthenticated && (
                    <nav className="flex items-center gap-6 text-gray-200">
                        {menu.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-cyan-300 transition-colors font-medium"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                )}

                {/* RIGHT SIDE */}
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">

                        <div className="relative">
                            <button
                                onClick={() => setOpen(!open)}
                                className="text-gray-200 font-semibold hover:text-cyan-300"
                            >
                                {user?.name || user?.email}
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 z-50">
                                    <button
                                        className="block px-4 py-2 hover:bg-gray-100 text-gray-800"
                                        onClick={handleProfile}
                                    >
                                        Profile Settings
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                ) : (
                    <Link
                        href="/auth"
                        className="
              px-4 py-2 rounded-lg 
              bg-gradient-to-r from-indigo-600 to-cyan-500 
              text-white font-bold
              hover:scale-[1.03] transition-all
            "
                    >
                        Login
                    </Link>
                )}
            </div>

            {/* Outer glow */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-600/40 via-purple-500/30 to-cyan-400/40 blur-3xl" />
        </header>
    );
}

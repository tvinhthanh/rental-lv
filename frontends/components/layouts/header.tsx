"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROLE_MENU_HEADER } from "@/lib/role-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Settings, FileText } from "lucide-react";
import { useProfile } from "@/hooks/auth/user-profile";
import ThemeSwitch from "@/components/common/theme-switch";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function Header() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { profile } = useProfile(); // Get profile to access avatarUrl
    const [open, setOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const { settings } = useSettings();
    const siteName = settings?.siteName || "RENTAL SYSTEM";
    const adminMenuRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
                setAdminMenuOpen(false);
            }
            if (open && !(event.target as HTMLElement).closest('.relative')) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [adminMenuOpen, open]);

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
        <header className="relative z-50 w-full px-6 py-4">
            {/* BG Blur */}
            <div className="absolute" />

            {/* Container */}
            <div
                className="
        relative z-50
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
                    {siteName.toUpperCase()}
                </Link>

                {/* ROLE MENU */}
                {isAuthenticated && (
                    <nav className="flex items-center gap-6 text-gray-200">
                        {menu.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-cyan-300 transition-colors font-medium cursor-pointer"
                                prefetch={true}
                            >
                                {item.label}
                            </Link>
                        ))}
                        
                        {/* Admin Dropdown Menu */}
                        {user?.role === "ADMIN" && (
                            <div className="relative" ref={adminMenuRef}>
                                <button
                                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                                    className="flex items-center gap-1 hover:text-cyan-300 transition-colors font-medium"
                                >
                                    Quản trị
                                    <ChevronDown className={`w-4 h-4 transition-transform ${adminMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                {adminMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-sm shadow-lg rounded-lg py-2 z-50 border border-white/20">
                                        <Link
                                            href="/admin/settings"
                                            onClick={() => setAdminMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 text-gray-800 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Cài đặt</span>
                                        </Link>
                                        <Link
                                            href="/admin/audit-logs"
                                            onClick={() => setAdminMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-white/20 text-gray-800 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            <span>Nhật ký hệ thống</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                )}

                {/* RIGHT SIDE */}
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        {/* Notification Center */}
                        <NotificationCenter />
                        
                        {/* Theme Switch */}
                        <ThemeSwitch />

                        <div className="relative">
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 text-gray-200 font-semibold hover:text-cyan-300 transition-colors"
                            >
                                {(() => {
                                    // Get avatarUrl from profile first, then from user
                                    const avatarUrl = profile?.avatarUrl || user?.avatarUrl || user?.avatar;
                                    
                                    if (avatarUrl) {
                                        // Check if URL is absolute or relative
                                        const isAbsoluteUrl = avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://') || avatarUrl.startsWith('//');
                                        const imageUrl = isAbsoluteUrl 
                                            ? avatarUrl 
                                            : `${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001'}${avatarUrl.startsWith('/') ? '' : '/'}${avatarUrl}`;
                                        
                                        return (
                                            <img 
                                                src={imageUrl} 
                                                alt={user?.name || user?.email || "User"}
                                                className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400/30"
                                                onError={(e) => {
                                                    // On error, replace with fallback
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        e.currentTarget.style.display = 'none';
                                                        const fallback = document.createElement('div');
                                                        fallback.className = 'w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-400/30';
                                                        fallback.textContent = (user?.name || user?.email || "U").charAt(0).toUpperCase();
                                                        parent.insertBefore(fallback, e.currentTarget);
                                                    }
                                                }}
                                            />
                                        );
                                    }
                                    
                                    // No avatar - show fallback with initial
                                    return (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm border-2 border-cyan-400/30">
                                            {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                                        </div>
                                    );
                                })()}
                                <span>{user?.name || user?.email}</span>
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

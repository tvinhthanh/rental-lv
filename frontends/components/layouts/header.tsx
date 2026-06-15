"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ROLE_MENU_HEADER } from "@/lib/role-menu";
import { useSettings } from "@/contexts/SettingsContext";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, Settings, FileText, Menu, X } from "lucide-react";
import { useProfile } from "@/hooks/auth/user-profile";
import ThemeSwitch from "@/components/common/theme-switch";
import NotificationCenter from "@/components/notifications/NotificationCenter";

export default function Header() {
    const pathname = usePathname();

    // Hide header on admin and employee routes
    if (pathname?.startsWith("/admin") || pathname?.startsWith("/employee")) {
        return null;
    }

    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { profile } = useProfile(); // Get profile to access avatarUrl
    const [open, setOpen] = useState(false);
    const [adminMenuOpen, setAdminMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { settings } = useSettings();
    const siteName = settings?.siteName || "RENTAL SYSTEM";
    const adminMenuRef = useRef<HTMLDivElement>(null);

    // Close mobile menu and dropdowns when navigating/changing route
    useEffect(() => {
        setMobileMenuOpen(false);
        setOpen(false);
        setAdminMenuOpen(false);
    }, [pathname]);

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

                {/* ROLE MENU (Desktop) */}
                {isAuthenticated && (
                    <nav className="hidden md:flex items-center gap-6 text-gray-200">
                        {menu.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="hover:text-cyan-300 transition-colors font-medium cursor-pointer text-sm"
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
                                    className="flex items-center gap-1 hover:text-cyan-300 transition-colors font-medium text-sm"
                                >
                                    Quản trị
                                    <ChevronDown className={`w-4 h-4 transition-transform ${adminMenuOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                {adminMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 shadow-xl rounded-lg py-2 z-[100]">
                                        <Link
                                            href="/admin/settings"
                                            onClick={() => setAdminMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-sm"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Cài đặt</span>
                                        </Link>
                                        <Link
                                            href="/admin/audit-logs"
                                            onClick={() => setAdminMenuOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 text-slate-200 hover:text-white transition-colors text-sm"
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
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Notification Center */}
                        <NotificationCenter />
                        
                        {/* Theme Switch */}
                        <ThemeSwitch />

                        {/* User Profile */}
                        <div className="relative">
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex items-center gap-2 text-gray-200 font-semibold hover:text-cyan-300 transition-colors"
                            >
                                {(() => {
                                    // Get avatarUrl from profile (user object doesn't have avatarUrl)
                                    const avatarUrl = profile?.avatarUrl;
                                    
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
                                <span className="hidden sm:inline max-w-[120px] truncate text-sm">{user?.name || user?.email}</span>
                            </button>

                            {open && (
                                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-850 shadow-xl rounded-lg py-2 z-[100]">
                                    <button
                                        className="block px-4 py-2 hover:bg-slate-800 text-slate-300 hover:text-white w-full text-left text-sm"
                                        onClick={handleProfile}
                                    >
                                        Cài đặt tài khoản
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 hover:bg-slate-800 text-red-400 hover:text-red-300 text-sm"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Menu (Mobile Only) */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                ) : (
                    <Link
                        href="/auth"
                        className="
              px-4 py-2 rounded-lg 
              bg-gradient-to-r from-indigo-600 to-cyan-500 
              text-white font-bold text-sm
              hover:scale-[1.03] transition-all
            "
                    >
                        Đăng nhập
                    </Link>
                )}
            </div>

            {/* Mobile Menu Panel (Drawer) */}
            {mobileMenuOpen && isAuthenticated && (
                <div className="absolute top-20 left-6 right-6 bg-slate-900/95 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-2xl p-4 flex flex-col gap-2.5 z-[100] md:hidden">
                    {menu.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-2.5 hover:bg-slate-800/60 rounded-xl text-slate-300 hover:text-white transition-colors font-medium text-sm"
                        >
                            {item.label}
                        </Link>
                    ))}
                    
                    {user?.role === "ADMIN" && (
                        <div className="border-t border-slate-800/60 pt-2.5 flex flex-col gap-2">
                            <Link
                                href="/admin/settings"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800/60 rounded-xl text-slate-300 hover:text-white transition-colors text-sm"
                            >
                                <Settings className="w-4 h-4" />
                                <span>Cài đặt</span>
                            </Link>
                            <Link
                                href="/admin/audit-logs"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800/60 rounded-xl text-slate-300 hover:text-white transition-colors text-sm"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Nhật ký hệ thống</span>
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Outer glow */}
            <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-indigo-600/40 via-purple-500/30 to-cyan-400/40 blur-3xl" />
        </header>
    );
}

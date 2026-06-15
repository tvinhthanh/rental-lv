"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth/use-auth";
import { ROLE_MENU_SIDEBAR, MenuItem } from "@/lib/role-menu-sidebar";
import ThemeSwitch from "@/components/common/theme-switch";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { 
    LayoutDashboard, Users, CalendarDays, Car, MapPin, Tags, FileText, 
    CreditCard, ShieldAlert, AlertTriangle, UserCheck, Megaphone, Award, 
    Sliders, History, Wrench, Key, ClipboardCheck, BookOpen, Percent, 
    Star, Tag, UsersRound, HelpCircle, LogOut, Menu, X, ChevronDown, ChevronRight
} from "lucide-react";

// Map labels to Lucide Icons for high-fidelity appearance
const getIcon = (label: string) => {
    switch (label) {
        case "Chi nhánh": return MapPin;
        case "Danh mục giá": return Tags;
        case "Đơn đặt xe": return CalendarDays;
        case "Hợp đồng": return FileText;
        case "Giao xe": return Key;
        case "Nhận xe": return ClipboardCheck;
        case "Hóa đơn": return FileText;
        case "Thanh toán": return CreditCard;
        case "Tiền cọc": return ShieldAlert;
        case "Phụ phí": return AlertTriangle;
        case "Người dùng": return Users;
        case "Khách hàng": return UserCheck;
        case "Mẫu thông báo": return Megaphone;
        case "Phân khúc khách hàng": return UsersRound;
        case "Chiến dịch marketing": return Megaphone;
        case "Chương trình tích điểm": return Award;
        case "Giao dịch tích điểm": return Award;
        case "Blog": return BookOpen;
        case "Khuyến mãi": return Percent;
        case "Đánh giá": return Star;
        case "Bảo dưỡng": return Wrench;
        case "Thương hiệu": return Tag;
        case "Quy tắc định giá": return Tags;
        case "Đối tác": return UsersRound;
        case "Danh sách xe": return Car;
        case "Danh mục xe": return Tags;
        case "Nhân viên": return Users;
        case "Cài đặt": return Sliders;
        case "Nhật ký hệ thống": return History;
        case "Xe": return Car;
        case "Dashboard": return LayoutDashboard;
        default: return HelpCircle;
    }
};

export function Sidebar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [manuallyToggledMenus, setManuallyToggledMenus] = useState<Record<string, boolean>>({});
    const [prevPathname, setPrevPathname] = useState(pathname);

    // Reset manual toggles when navigating to a different page
    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setManuallyToggledMenus({});
    }

    const menu = user && user.role
        ? (ROLE_MENU_SIDEBAR[user.role as keyof typeof ROLE_MENU_SIDEBAR] || []) as (MenuItem | string)[]
        : [];

    // Derive which menus should be open dynamically
    const openMenusState = React.useMemo(() => {
        const state: Record<string, boolean> = {};
        menu.forEach((item) => {
            if (typeof item !== "string" && item.children) {
                const hasActiveChild = item.children.some(
                    (child) => child.href && pathname === child.href
                );
                const defaultOpen = hasActiveChild;
                const manual = manuallyToggledMenus[item.label];
                state[item.label] = manual !== undefined ? manual : defaultOpen;
            }
        });
        return state;
    }, [menu, pathname, manuallyToggledMenus]);

    const toggleMenu = (label: string) => {
        setManuallyToggledMenus((prev) => ({
            ...prev,
            [label]: !openMenusState[label],
        }));
    };

    const isActive = (item: MenuItem): boolean => {
        if (item.href && pathname === item.href) return true;
        if (item.children) {
            return item.children.some((child) => isActive(child));
        }
        return false;
    };

    const handleLogout = () => {
        logout();
        window.location.href = "/auth";
    };

    if (!user || !user.role) return null;

    const SidebarContent = () => (
        <div className="flex flex-col min-h-full">
            <div>
                {/* Header Brand */}
                <div className="flex flex-col gap-1.5 px-3 py-4 mb-6 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#22d3ee]" />
                        <span className="font-black tracking-widest text-lg bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent uppercase">
                            Hệ Thống Thuê Xe
                        </span>
                    </div>
                    <div>
                        <span className={`text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full border ${
                            user.role === "ADMIN" 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/25" 
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                        }`}>
                            {user.role === "ADMIN" ? "QUẢN TRỊ VIÊN" : "NHÂN VIÊN"}
                        </span>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="flex flex-col gap-1 px-1">
                    {menu.map((item, index) => {
                        if (typeof item === "string") {
                            return (
                                <div key={`sep-${index}`} className="h-px bg-slate-800/50 my-3 mx-2" />
                            );
                        }

                        const hasChildren = item.children && item.children.length > 0;
                        const isOpen = openMenusState[item.label] || false;
                        const active = isActive(item);
                        const IconComponent = getIcon(item.label);

                        if (hasChildren) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-transparent transition-all duration-200 group
                                            ${active
                                                ? "bg-slate-800/60 text-cyan-400 font-semibold"
                                                : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconComponent className={`w-4 h-4 transition-transform duration-200 ${
                                                active ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                                            }`} />
                                            <span className="text-sm tracking-wide">{item.label}</span>
                                        </div>
                                        {isOpen ? (
                                            <ChevronDown className="w-4 h-4 text-slate-500" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-500" />
                                        )}
                                    </button>
                                    
                                    {isOpen && (
                                        <div className="pl-4 border-l border-slate-800/80 ml-5 mt-1 space-y-1">
                                            {item.children!.map((child) => {
                                                const childActive = pathname === child.href;
                                                const ChildIcon = getIcon(child.label);
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href!}
                                                        onClick={() => setIsMobileOpen(false)}
                                                        className={`
                                                            flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-150 text-xs tracking-wide
                                                            ${childActive
                                                                ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 font-semibold border-l-2 border-cyan-400"
                                                                : "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200"
                                                            }
                                                        `}
                                                    >
                                                        <ChildIcon className="w-3.5 h-3.5 opacity-70" />
                                                        <span>{child.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        // Regular single link
                        const itemActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href!}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                                    ${itemActive
                                        ? "bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-400 font-semibold border-l-2 border-cyan-400 shadow-[0_0_15px_-3px_rgba(34,211,238,0.15)]"
                                        : "hover:bg-slate-800/40 text-slate-400 hover:text-slate-200"
                                    }
                                `}
                            >
                                <IconComponent className={`w-4 h-4 ${
                                    itemActive ? "text-cyan-400" : "text-slate-400 group-hover:text-slate-200"
                                }`} />
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile Card & Logout */}
            <div className="mt-auto pt-4 border-t border-slate-850/80 space-y-3">
                {/* System Controls */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/40 border border-slate-900/50 backdrop-blur-sm">
                    <span className="text-xs font-medium text-slate-400">Giao diện & Thông báo</span>
                    <div className="flex items-center gap-2.5">
                        <NotificationCenter />
                        <ThemeSwitch />
                    </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-900/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md border border-cyan-400/20 shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-slate-200 truncate">
                                {user.name || "Nhân viên"}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[110px]">
                                {user.email}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 shrink-0"
                        title="Đăng xuất"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-slate-900/90 border border-slate-800 rounded-lg flex items-center justify-center text-slate-200 hover:bg-slate-850 transition-colors backdrop-blur"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-slate-950/80 backdrop-blur-xl text-slate-200 border-r border-slate-900/80
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                overflow-y-auto shadow-2xl flex flex-col p-4
            `}>
                <SidebarContent />
            </aside>
        </>
    );
}

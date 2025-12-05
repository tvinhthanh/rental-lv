"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/auth/use-auth";
import { ROLE_MENU_SIDEBAR, MenuItem } from "@/lib/role-menu-sidebar";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Menu, X } from "lucide-react";

export function Sidebar() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menu = user && user.role
        ? (ROLE_MENU_SIDEBAR[user.role as keyof typeof ROLE_MENU_SIDEBAR] || []) as (MenuItem | string)[]
        : [];

    const [openMenusState, setOpenMenusState] = useState<Record<string, boolean>>({});

    // Auto-open menus with active children when pathname changes
    useEffect(() => {
        if (!user || !user.role || menu.length === 0) return;

        const open: Record<string, boolean> = {};
        menu.forEach((item) => {
            if (typeof item !== "string" && item.children) {
                const hasActiveChild = item.children.some(
                    (child) => child.href && pathname === child.href
                );
                if (hasActiveChild) {
                    open[item.label] = true;
                }
            }
        });
        if (Object.keys(open).length > 0) {
            setOpenMenusState((prev) => {
                const newState = { ...prev, ...open };
                return newState;
            });
        }
    }, [pathname, user, menu]);

    const toggleMenu = (label: string) => {
        setOpenMenusState((prev) => ({
            ...prev,
            [label]: !prev[label],
        }));
    };

    const isActive = (item: MenuItem): boolean => {
        if (item.href && pathname === item.href) return true;
        if (item.children) {
            return item.children.some((child) => isActive(child));
        }
        return false;
    };

    if (!user || !user.role) return null;

    const SidebarContent = () => (
        <nav className="flex flex-col gap-1">
                {menu.map((item, index) => {
                    // Handle string separators
                    if (typeof item === "string") {
                        return (
                            <div key={`sep-${index}`} className="h-px bg-slate-700 my-2" />
                        );
                    }

                    const hasChildren = item.children && item.children.length > 0;
                    const isOpen = openMenusState[item.label] || false;
                    const active = isActive(item);

                    if (hasChildren) {
                        const parentActive = isActive(item);
                        return (
                            <div key={item.label}>
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className={`
                                        w-full flex items-center justify-between px-3 py-2 rounded-lg transition
                                        ${parentActive
                                            ? "bg-cyan-600/20 text-cyan-300"
                                            : "hover:bg-slate-700"
                                        }
                                    `}
                                >
                                    <span className="font-medium">{item.label}</span>
                                    {isOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                                
                                {isOpen && (
                                    <div className="ml-4 mt-1 space-y-1">
                                        {item.children!.map((child) => {
                                            const childActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.href}
                                                    href={child.href!}
                                                    onClick={() => setIsMobileOpen(false)}
                                                    className={`
                                                        block px-3 py-2 rounded-lg transition text-sm
                                                        ${childActive
                                                            ? "bg-cyan-600 text-white"
                                                            : "hover:bg-slate-700 text-gray-300"
                                                        }
                                                    `}
                                                >
                                                    {child.label}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    // Regular menu item
                    const itemActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href!}
                            onClick={() => setIsMobileOpen(false)}
                            className={`
                                px-3 py-2 rounded-lg transition text-sm sm:text-base
                                ${itemActive
                                    ? "bg-cyan-600 text-white"
                                    : "hover:bg-slate-700"
                                }
                            `}
                        >
                            {item.label}
                        </Link>
                    );
                })}
        </nav>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-gray-200 hover:bg-slate-700 transition-colors"
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

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-40
                w-64 bg-slate-800 text-gray-200 border-r border-slate-700
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                overflow-y-auto
            `}>
                <div className="p-3 sm:p-4">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                        <h2 className="text-lg font-semibold text-white">Menu</h2>
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <SidebarContent />
                </div>
            </aside>
        </>
    );
}

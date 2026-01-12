"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, Check, CheckCheck, X } from "lucide-react";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/hooks/auth/use-auth";
import { getSocket } from "@/lib/socket";
// Helper function to format date
const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return "Vừa xong";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return then.toLocaleDateString("vi-VN");
};
import { toast } from "sonner";

export default function NotificationCenter() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadNotifications = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [notificationsRes, countRes] = await Promise.all([
                notificationService.list({ limit: 20 }),
                notificationService.getUnreadCount(),
            ]);

            const items = Array.isArray(notificationsRes?.items)
                ? notificationsRes.items
                : Array.isArray(notificationsRes)
                ? notificationsRes
                : [];
            setNotifications(items);

            const count = countRes?.count || countRes || 0;
            setUnreadCount(Number(count));
        } catch (err: any) {
            console.error("Load notifications failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        loadNotifications();

        // Setup socket listener for new notifications
        const socket = getSocket();
        if (socket) {
            const handleNewNotification = (data: any) => {
                // Add new notification to the top of the list
                setNotifications((prev) => [data, ...prev.slice(0, 19)]);
                setUnreadCount((prev) => prev + 1);
            };

            socket.on("notification", handleNewNotification);

            return () => {
                socket.off("notification", handleNewNotification);
            };
        }
    }, [user]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err: any) {
            toast.error("Đánh dấu đã đọc thất bại");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
            toast.success("Đã đánh dấu tất cả là đã đọc");
        } catch (err: any) {
            toast.error("Đánh dấu tất cả thất bại");
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await notificationService.delete(id);
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            toast.success("Đã xóa thông báo");
        } catch (err: any) {
            toast.error("Xóa thông báo thất bại");
        }
    };

    if (!user) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => {
                    setOpen(!open);
                    if (!open) {
                        loadNotifications();
                    }
                }}
                className="relative p-2 text-gray-200 hover:text-cyan-300 transition-all hover:scale-110 rounded-lg hover:bg-white/10"
                title="Thông báo"
            >
                <Bell className={`w-5 h-5 transition-transform ${open ? "animate-pulse" : ""}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
                        <div className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-blue-400" />
                            <h3 className="font-semibold text-white">Thông báo</h3>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
                                    title="Đánh dấu tất cả đã đọc"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    Đã đọc tất cả
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {loading ? (
                            <div className="p-4 text-center text-slate-400">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mx-auto" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {notifications.map((notification, index) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-slate-800/50 transition-all duration-200 ${
                                            !notification.read ? "bg-blue-500/10 border-l-2 border-l-blue-500" : ""
                                        }`}
                                        style={{
                                            animationDelay: `${index * 50}ms`,
                                        }}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            {!notification.read && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0 animate-pulse" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-medium text-white text-sm">
                                                        {notification.title || "Thông báo"}
                                                    </h4>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                    )}
                                                </div>
                                                <p className="text-slate-300 text-xs mb-2 line-clamp-2">
                                                    {notification.message || notification.content}
                                                </p>
                                                {notification.createdAt && (
                                                    <p className="text-slate-500 text-xs flex items-center gap-1">
                                                        {formatTimeAgo(notification.createdAt)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-all"
                                                        title="Đánh dấu đã đọc"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-all"
                                                    title="Xóa"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-700 bg-slate-800/30 rounded-b-xl text-center">
                            <button
                                onClick={() => {
                                    setOpen(false);
                                    // Navigate to full notifications page if exists
                                    // window.location.href = "/notifications";
                                }}
                                className="text-xs text-blue-400 hover:text-blue-300 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                            >
                                Xem tất cả thông báo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { auditLogService } from "@/services/audit-log.service";
import { FileText, User, Calendar, Tag, Search } from "lucide-react";

export default function AdminAuditLogsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit] = useState<number>(20);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [selectedLog, setSelectedLog] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        module: "",
        action: "",
        userId: "",
        search: "",
    });

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadLogs() {
            try {
                setLoading(true);
                const res = await auditLogService.list({
                    ...filters,
                    page,
                    limit,
                });

                const items = Array.isArray(res?.items) ? res.items : [];
                setLogs(items);
                setTotal(res?.total || 0);
                setPage(res?.page || page);
                setTotalPages(res?.totalPages || Math.ceil((res?.total || 0) / limit));
            } catch (err) {
                console.error("Load audit logs failed:", err);
                setError("Không thể tải danh sách nhật ký");
            } finally {
                setLoading(false);
            }
        }

        loadLogs();
    }, [user, userLoading, page, limit, filters]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    const actionColors: Record<string, string> = {
        CREATE: "bg-emerald-500/20 text-emerald-400",
        UPDATE: "bg-blue-500/20 text-blue-400",
        DELETE: "bg-red-500/20 text-red-400",
        LOGIN: "bg-green-500/20 text-green-400",
        LOGOUT: "bg-slate-500/20 text-slate-400",
        STATUS: "bg-yellow-500/20 text-yellow-400",
        SIGN: "bg-purple-500/20 text-purple-400",
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Nhật Ký Hệ Thống
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý nhật ký hoạt động trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng nhật ký</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                        />
                    </div>

                    <select
                        value={filters.module}
                        onChange={(e) => setFilters({ ...filters, module: e.target.value })}
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
                    >
                        <option value="">Tất cả Module</option>
                        <option value="Contract">Contract</option>
                        <option value="Booking">Booking</option>
                        <option value="Vehicle">Vehicle</option>
                        <option value="Customer">Customer</option>
                        <option value="Auth">Auth</option>
                    </select>

                    <select
                        value={filters.action}
                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
                    >
                        <option value="">Tất cả Action</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="LOGIN">LOGIN</option>
                    </select>

                    <input
                        type="text"
                        placeholder="User ID..."
                        value={filters.userId}
                        onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                        className="rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder-slate-500"
                    />
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Logs Grid */}
                {logs.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có nhật ký nào trong hệ thống.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    onClick={() => {
                                        setSelectedLog(log);
                                        setOpenModal(true);
                                    }}
                                    className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                               hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 
                                               transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-blue-400" />
                                            <span className="text-xs font-semibold text-blue-400">
                                                {log.module || "—"}
                                            </span>
                                        </div>
                                        <span className={`px-2 py-1 text-xs rounded-full ${actionColors[log.action] || "bg-slate-500/20 text-slate-400"}`}>
                                            {log.action || "—"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        {log.userId && (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-slate-400" />
                                                <span className="text-gray-300 text-xs">
                                                    User: {log.userId.substring(0, 8)}...
                                                </span>
                                            </div>
                                        )}
                                        {log.createdAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span className="text-gray-300 text-xs">
                                                    {new Date(log.createdAt).toLocaleString("vi-VN")}
                                                </span>
                                            </div>
                                        )}
                                        {log.entityId && (
                                            <p className="text-gray-400 text-xs">
                                                Entity: {log.entityId.substring(0, 8)}...
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                                >
                                    Trước
                                </button>
                                <span className="text-sm text-slate-400">
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                                    disabled={page === totalPages}
                                    className="rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Modal */}
                {openModal && selectedLog && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Chi Tiết Nhật Ký</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        ID: {selectedLog.id}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Module</p>
                                    <p className="text-white text-lg font-semibold">{selectedLog.module || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Action</p>
                                    <p className={`text-lg font-semibold ${actionColors[selectedLog.action] || "text-slate-400"}`}>
                                        {selectedLog.action || "—"}
                                    </p>
                                </div>

                                {selectedLog.userId && (
                                    <div>
                                        <p className="text-slate-400">User ID</p>
                                        <p className="text-white">{selectedLog.userId}</p>
                                    </div>
                                )}

                                {selectedLog.entityId && (
                                    <div>
                                        <p className="text-slate-400">Entity ID</p>
                                        <p className="text-white">{selectedLog.entityId}</p>
                                    </div>
                                )}

                                {selectedLog.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Thời gian</p>
                                        <p className="text-white">
                                            {new Date(selectedLog.createdAt).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedLog.metadata && (
                                    <div>
                                        <p className="text-slate-400">Metadata</p>
                                        <pre className="mt-2 rounded-lg bg-slate-900 p-4 text-xs text-white overflow-x-auto">
                                            {JSON.stringify(selectedLog.metadata, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

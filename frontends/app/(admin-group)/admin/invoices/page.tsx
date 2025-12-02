"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import { FileText } from "lucide-react";

export default function AdminInvoicesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadInvoices() {
            try {
                setLoading(true);
                const res = await billingService.invoices();
                const items = Array.isArray(res) ? res : (res?.items || []);
                setInvoices(items);
                setTotal(items.length);
            } catch (err) {
                console.error("Load invoices failed:", err);
                setError("Không thể tải danh sách hóa đơn");
            } finally {
                setLoading(false);
            }
        }

        loadInvoices();
    }, [user, userLoading]);

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

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Hóa Đơn
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả hóa đơn trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng hóa đơn</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Invoices Grid */}
                {invoices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có hóa đơn nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm font-semibold text-blue-400">
                                            {invoice.invoiceNo || "—"}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        invoice.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                        invoice.status === "UNPAID" ? "bg-yellow-500/20 text-yellow-400" :
                                        "bg-slate-500/20 text-slate-400"
                                    }`}>
                                        {invoice.status || "UNPAID"}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Khách hàng:</span> {invoice.customer?.fullName || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Booking:</span> {invoice.booking?.bookingCode || "—"}
                                    </p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {invoice.totalAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {openModal && selectedInvoice && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Chi Tiết Hóa Đơn
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Mã: {selectedInvoice.invoiceNo || "—"}
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
                                    <p className="text-slate-400">Trạng thái</p>
                                    <p className={`text-lg font-semibold ${
                                        selectedInvoice.status === "PAID" ? "text-emerald-400" :
                                        selectedInvoice.status === "UNPAID" ? "text-yellow-400" :
                                        "text-slate-400"
                                    }`}>
                                        {selectedInvoice.status || "UNPAID"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Khách hàng</p>
                                    <p className="text-white">{selectedInvoice.customer?.fullName || "—"}</p>
                                    <p className="text-slate-400">{selectedInvoice.customer?.phone || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Booking</p>
                                    <p className="text-white">{selectedInvoice.booking?.bookingCode || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Tổng tiền</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {selectedInvoice.totalAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>

                                {selectedInvoice.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
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

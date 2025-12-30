"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import { FileText, Download, Eye } from "lucide-react";

export default function UserInvoicesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user) {
            setLoading(false);
            return;
        }

        async function loadInvoices() {
            try {
                setLoading(true);
                // Load invoices for current user
                const res = await billingService.getAllInvoices({ limit: 1000 });
                const data = res?.data || res;
                const items = data?.items || (Array.isArray(data) ? data : []);
                // Filter by current user if needed (backend should handle this)
                setInvoices(items);
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

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Hóa Đơn Của Tôi
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Xem và quản lý tất cả hóa đơn của bạn
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng hóa đơn</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {invoices.length.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Invoices List */}
                {invoices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Bạn chưa có hóa đơn nào.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-6 hover:border-blue-400/50 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                            <h3 className="text-lg font-semibold text-white">
                                                Hóa đơn #{invoice.invoiceNo || invoice.id?.slice(0, 8)}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                invoice.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                                invoice.status === "UNPAID" ? "bg-yellow-500/20 text-yellow-400" :
                                                invoice.status === "PENDING" ? "bg-blue-500/20 text-blue-400" :
                                                "bg-slate-500/20 text-slate-400"
                                            }`}>
                                                {invoice.status || "UNPAID"}
                                            </span>
                                        </div>
                                        {invoice.booking && (
                                            <p className="text-sm text-slate-400 mb-1">
                                                Booking: <span className="text-white">{invoice.booking.bookingCode || invoice.bookingId}</span>
                                            </p>
                                        )}
                                        {invoice.createdAt && (
                                            <p className="text-sm text-slate-400">
                                                Ngày tạo: {new Date(invoice.createdAt).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-2xl font-bold text-emerald-400 mb-2">
                                            {invoice.totalAmount?.toLocaleString("vi-VN")} đ
                                        </p>
                                        <button
                                            onClick={() => {
                                                setSelectedInvoice(invoice);
                                                setOpenModal(true);
                                            }}
                                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>

                                {invoice.payments && Array.isArray(invoice.payments) && invoice.payments.length > 0 && (
                                    <div className="pt-4 border-t border-slate-700">
                                        <p className="text-sm text-slate-400 mb-2">Thanh toán:</p>
                                        <div className="space-y-2">
                                            {invoice.payments.map((payment: any, idx: number) => (
                                                <div key={idx} className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400">
                                                        {new Date(payment.createdAt || payment.date).toLocaleDateString("vi-VN")}
                                                    </span>
                                                    <span className="text-green-400 font-semibold">
                                                        {payment.amount?.toLocaleString("vi-VN")} đ
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
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
                                        Mã: {selectedInvoice.invoiceNo || selectedInvoice.id?.slice(0, 8)}
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

                                {selectedInvoice.booking && (
                                    <div>
                                        <p className="text-slate-400">Booking</p>
                                        <p className="text-white">{selectedInvoice.booking.bookingCode || selectedInvoice.bookingId}</p>
                                        {selectedInvoice.booking.vehicle && (
                                            <p className="text-slate-300 text-xs mt-1">
                                                Xe: {selectedInvoice.booking.vehicle.name}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <p className="text-slate-400">Tổng tiền</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {selectedInvoice.totalAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>

                                {selectedInvoice.payments && Array.isArray(selectedInvoice.payments) && selectedInvoice.payments.length > 0 && (
                                    <div>
                                        <p className="text-slate-400 mb-2">Lịch sử thanh toán</p>
                                        <div className="space-y-2">
                                            {selectedInvoice.payments.map((payment: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-white font-medium">
                                                            {new Date(payment.createdAt || payment.date).toLocaleDateString("vi-VN", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </p>
                                                        <p className="text-slate-400 text-xs">{payment.method || "Tiền mặt"}</p>
                                                    </div>
                                                    <p className="text-green-400 font-semibold">
                                                        {payment.amount?.toLocaleString("vi-VN")} đ
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedInvoice.totalAmount && (
                                            <div className="mt-3 pt-3 border-t border-slate-700">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-slate-400">Còn lại:</p>
                                                    <p className="text-yellow-400 font-semibold">
                                                        {Math.max(0, selectedInvoice.totalAmount - selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)).toLocaleString("vi-VN")} đ
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedInvoice.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
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

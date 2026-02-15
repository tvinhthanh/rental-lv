"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import { FileText, Download, Eye, DollarSign, CreditCard, Wallet } from "lucide-react";
import { useFormatVND } from "@/hooks/useFormatVND";

export default function UserInvoicesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { formatVND } = useFormatVND();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);
    
    // User statistics
    const [userStats, setUserStats] = useState({
        totalSpent: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        invoiceCount: 0
    });

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
                
                // Calculate user statistics
                let totalSpent = 0;
                let totalPaid = 0;
                let totalUnpaid = 0;
                
                items.forEach((inv: any) => {
                    totalSpent += inv.totalAmount || 0;
                    const payments = inv.payments || [];
                    const paymentsTotal = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                    
                    if (inv.status === 'PAID' || paymentsTotal >= inv.totalAmount) {
                        totalPaid += inv.totalAmount || 0;
                    } else {
                        totalUnpaid += (inv.totalAmount || 0) - paymentsTotal;
                    }
                });
                
                setUserStats({
                    totalSpent,
                    totalPaid,
                    totalUnpaid,
                    invoiceCount: items.length
                });
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
                            {userStats.invoiceCount.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* User Statistics */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs text-slate-400">Tổng đã chi</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">
                            {formatVND(userStats.totalSpent)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <CreditCard className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-slate-400">Đã thanh toán</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">
                            {formatVND(userStats.totalPaid)}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <Wallet className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-slate-400">Còn nợ</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">
                            {formatVND(userStats.totalUnpaid)}
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

                            <div className="space-y-6 text-sm">
                                {/* Status & Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-400 mb-1">Trạng thái</p>
                                        <p className={`text-lg font-semibold ${
                                            selectedInvoice.status === "PAID" ? "text-emerald-400" :
                                            selectedInvoice.status === "UNPAID" ? "text-yellow-400" :
                                            "text-slate-400"
                                        }`}>
                                            {selectedInvoice.status || "UNPAID"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-400 mb-1">Ngày tạo</p>
                                        <p className="text-white">
                                            {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN", {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Booking Info */}
                                {selectedInvoice.booking && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-2">Thông tin đặt xe</p>
                                        <p className="text-white font-semibold">Booking: {selectedInvoice.booking.bookingCode || selectedInvoice.bookingId}</p>
                                        {selectedInvoice.booking.vehicle && (
                                            <p className="text-slate-300 text-xs mt-1">
                                                Xe: {selectedInvoice.booking.vehicle.name} ({selectedInvoice.booking.vehicle.licensePlate})
                                            </p>
                                        )}
                                        {selectedInvoice.booking.pickupDate && (
                                            <p className="text-slate-400 text-xs mt-1">
                                                Nhận: {new Date(selectedInvoice.booking.pickupDate).toLocaleDateString("vi-VN")} - 
                                                Trả: {new Date(selectedInvoice.booking.returnDate).toLocaleDateString("vi-VN")}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Financial Breakdown */}
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                    <p className="text-slate-400 mb-3 font-semibold">Chi tiết hóa đơn</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Tổng phụ:</span>
                                            <span className="text-white font-semibold">{formatVND(selectedInvoice.subtotal || 0)}</span>
                                        </div>
                                        {selectedInvoice.surchargeTotal > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Phí phát sinh:</span>
                                                <span className="text-yellow-400 font-semibold">+{formatVND(selectedInvoice.surchargeTotal)}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.discountTotal > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Giảm giá:</span>
                                                <span className="text-blue-400 font-semibold">-{formatVND(selectedInvoice.discountTotal)}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.depositApplied > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Tiền cọc áp dụng:</span>
                                                <span className="text-purple-400 font-semibold">-{formatVND(selectedInvoice.depositApplied)}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-slate-700 flex justify-between">
                                            <span className="text-slate-300 font-semibold">Tổng cộng:</span>
                                            <span className="text-emerald-400 text-xl font-bold">{formatVND(selectedInvoice.totalAmount || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payments */}
                                {selectedInvoice.payments && Array.isArray(selectedInvoice.payments) && selectedInvoice.payments.length > 0 && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-3 font-semibold">Lịch sử thanh toán ({selectedInvoice.payments.length})</p>
                                        <div className="space-y-2">
                                            {selectedInvoice.payments.map((payment: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                payment.method === 'CASH' ? 'bg-purple-500/20 text-purple-400' :
                                                                payment.method === 'STRIPE' || payment.method === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                                {payment.method === 'CASH' ? 'Tiền mặt' : payment.method === 'STRIPE' || payment.method === 'ONLINE' ? 'Stripe' : payment.method}
                                                            </span>
                                                            {payment.referenceNo && (
                                                                <span className="text-xs text-slate-500">Mã: {payment.referenceNo}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">
                                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("vi-VN", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            }) : payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "—"}
                                                        </p>
                                                        {payment.note && (
                                                            <p className="text-xs text-slate-500 mt-1">{payment.note}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-emerald-400 font-bold text-lg">
                                                        {formatVND(payment.amount || 0)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedInvoice.totalAmount && (
                                            <div className="mt-3 pt-3 border-t border-slate-700">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-300">Tổng đã thanh toán:</span>
                                                    <span className="text-blue-400 font-bold">
                                                        {formatVND(selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0))}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-slate-300">Còn lại:</span>
                                                    <span className={`font-bold ${
                                                        (selectedInvoice.totalAmount - selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)) > 0 
                                                            ? "text-yellow-400" : "text-emerald-400"
                                                    }`}>
                                                        {formatVND(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)))}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Surcharges */}
                                {selectedInvoice.surcharges && Array.isArray(selectedInvoice.surcharges) && selectedInvoice.surcharges.length > 0 && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-3 font-semibold">Phí phát sinh ({selectedInvoice.surcharges.length})</p>
                                        <div className="space-y-2">
                                            {selectedInvoice.surcharges.map((s: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-white font-semibold">{s.name}</span>
                                                        <span className="text-yellow-400 font-bold">{formatVND(s.amount || 0)}</span>
                                                    </div>
                                                    {s.description && (
                                                        <p className="text-xs text-slate-400">{s.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
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

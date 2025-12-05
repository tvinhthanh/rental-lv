"use client";

import { useState, useEffect } from "react";
import { billingService } from "@/services/billing.service";

type PaymentModalProps = {
    payment: any;
    onClose: () => void;
};

export default function PaymentModal({ payment, onClose }: PaymentModalProps) {
    const [invoice, setInvoice] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!payment?.invoiceId) return;
        async function loadInvoice() {
            try {
                setLoading(true);
                const res = await billingService.invoice(payment.invoiceId);
                setInvoice(res?.data || res);
            } catch (e) {
                console.error("Load invoice failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadInvoice();
    }, [payment?.invoiceId]);

    if (!payment) return null;

    const methodLabel: Record<string, string> = {
        CASH: "Tiền mặt",
        BANK_TRANSFER: "Chuyển khoản",
        CREDIT_CARD: "Thẻ tín dụng",
        DEBIT_CARD: "Thẻ ghi nợ",
        E_WALLET: "Ví điện tử",
        OTHER: "Khác",
    };

    const methodText = methodLabel[payment.method] || payment.method;

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Chi tiết thanh toán
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Mã HĐ: {payment.invoiceNo || "—"} • Booking: {payment.bookingCode || "—"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm text-slate-200">
                    {/* Payment Info */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-emerald-300 mb-3">
                            Thông tin thanh toán
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">Số tiền</p>
                                <p className="text-xl font-bold text-emerald-400">
                                    {payment.amount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Phương thức</p>
                                <p className="text-sm font-semibold text-blue-400">
                                    {methodText}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Trạng thái</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    payment.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400" :
                                    payment.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                                    "bg-slate-500/20 text-slate-400"
                                }`}>
                                    {payment.status || "SUCCESS"}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Ngày thanh toán</p>
                                <p className="text-sm text-slate-300">
                                    {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("vi-VN", {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    }) : "—"}
                                </p>
                            </div>
                        </div>
                        {payment.referenceNo && (
                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-xs text-slate-400">Mã tham chiếu</p>
                                <p className="text-sm text-slate-300">{payment.referenceNo}</p>
                            </div>
                        )}
                        {payment.note && (
                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-xs text-slate-400">Ghi chú</p>
                                <p className="text-sm text-slate-300">{payment.note}</p>
                            </div>
                        )}
                    </section>

                    {/* Customer */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin khách hàng
                        </h3>
                        <p><b>Họ tên:</b> {payment.customerName || "—"}</p>
                        <p><b>Booking:</b> {payment.bookingCode || "—"}</p>
                    </section>

                    {/* Vehicle */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin xe
                        </h3>
                        <p><b>Tên xe:</b> {payment.vehicleName || "—"}</p>
                        <p><b>Biển số:</b> {payment.licensePlate || "—"}</p>
                    </section>

                    {/* Invoice Info */}
                    {invoice && (() => {
                        const paymentsTotal = invoice.payments && Array.isArray(invoice.payments) 
                            ? invoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                            : 0;
                        const remaining = (invoice.totalAmount || 0) - paymentsTotal;
                        
                        return (
                            <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                                <h3 className="text-sm font-semibold text-blue-300 mb-1">
                                    Thông tin hóa đơn
                                </h3>
                                <div className={`grid gap-4 ${paymentsTotal > 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                                    <div>
                                        <p className="text-xs text-slate-400">Tổng tiền</p>
                                        <p className="font-semibold text-emerald-400">
                                            {invoice.totalAmount?.toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                    {paymentsTotal > 0 && (
                                        <>
                                            <div>
                                                <p className="text-xs text-slate-400">Đã thanh toán</p>
                                                <p className="font-semibold text-blue-400">
                                                    {paymentsTotal.toLocaleString("vi-VN")} đ
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400">Còn lại</p>
                                                <p className={`font-semibold ${
                                                    remaining > 0 ? "text-red-400" : "text-emerald-400"
                                                }`}>
                                                    {remaining.toLocaleString("vi-VN")} đ
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <p className="text-xs text-slate-400">Trạng thái</p>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            invoice.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                            invoice.status === "UNPAID" ? "bg-red-500/20 text-red-400" :
                                            "bg-slate-500/20 text-slate-400"
                                        }`}>
                                            {invoice.status}
                                        </span>
                                    </div>
                                </div>
                            </section>
                        );
                    })()}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}


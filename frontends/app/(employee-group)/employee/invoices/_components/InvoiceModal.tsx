"use client";

import { useState, useEffect } from "react";
import { CreditCard } from "lucide-react";
import { billingService } from "@/services/billing.service";
import { translateStatus } from "@/lib/utils";
import CreatePaymentModal from "./CreatePaymentModal";

type InvoiceModalProps = {
    invoice: any;
    onClose: () => void;
};

export default function InvoiceModal({ invoice, onClose }: InvoiceModalProps) {
    const [payments, setPayments] = useState<any[]>([]);
    const [surcharges, setSurcharges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    useEffect(() => {
        if (!invoice?.id) return;
        async function loadDetails() {
            try {
                setLoading(true);
                const [paymentsRes, surchargesRes] = await Promise.all([
                    billingService.payments(invoice.id),
                    billingService.surcharges(invoice.id)
                ]);
                setPayments(Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []));
                setSurcharges(Array.isArray(surchargesRes?.data) ? surchargesRes.data : (Array.isArray(surchargesRes) ? surchargesRes : []));
            } catch (e) {
                console.error("Load invoice details failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadDetails();
    }, [invoice?.id]);

    if (!invoice) return null;

    const booking = invoice.booking;
    const customer = booking?.customer || invoice.customer;
    const vehicle = booking?.vehicle;

    const paymentsTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const surchargesTotal = surcharges.reduce((sum, s) => sum + (s.amount || 0), 0);
    const remaining = invoice.totalAmount - paymentsTotal;

    async function refreshInvoice() {
        if (!invoice?.id) return;
        try {
            const [paymentsRes, surchargesRes] = await Promise.all([
                billingService.payments(invoice.id),
                billingService.surcharges(invoice.id)
            ]);
            setPayments(Array.isArray(paymentsRes?.data) ? paymentsRes.data : (Array.isArray(paymentsRes) ? paymentsRes : []));
            setSurcharges(Array.isArray(surchargesRes?.data) ? surchargesRes.data : (Array.isArray(surchargesRes) ? surchargesRes : []));
        } catch (e) {
            console.error("Refresh invoice failed", e);
        }
    }

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Hóa đơn {invoice.invoiceNo}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Booking: {booking?.bookingCode} • Ngày phát hành: {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            }) : "—"} • Ngày tạo: {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "—"}
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
                    {/* Customer */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin khách hàng
                        </h3>
                        <p><b>Họ tên:</b> {customer?.fullName || "—"}</p>
                        <p><b>Điện thoại:</b> {customer?.phone || "—"}</p>
                        <p><b>Email:</b> {customer?.email || "—"}</p>
                    </section>

                    {/* Vehicle */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin xe
                        </h3>
                        <p><b>Tên xe:</b> {vehicle?.name}</p>
                        <p><b>Biển số:</b> {vehicle?.licensePlate}</p>
                        <p><b>Loại xe:</b> {vehicle?.vehicleType}</p>
                    </section>

                    {/* Invoice Info */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-blue-300 mb-2">
                            Thông tin hóa đơn
                        </h3>
                        
                        {/* Main Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-950/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Tổng tiền</p>
                                <p className="font-bold text-lg text-emerald-400">
                                    {invoice.totalAmount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Đã thanh toán</p>
                                <p className="font-semibold text-blue-400">
                                    {paymentsTotal.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Còn lại</p>
                                <p className={`font-semibold ${remaining > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                    {remaining.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div className="bg-slate-950/50 rounded-lg p-3">
                                <p className="text-xs text-slate-400 mb-1">Trạng thái</p>
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    invoice.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                    invoice.status === "UNPAID" ? "bg-red-500/20 text-red-400" :
                                    "bg-slate-500/20 text-slate-400"
                                }`}>
                                    {translateStatus(invoice.status, 'invoice')}
                                </span>
                            </div>
                        </div>
                        
                        {/* Financial Breakdown */}
                        <div className="mt-3 pt-3 border-t border-slate-800">
                            <p className="text-xs text-slate-400 mb-2 font-semibold">Phân tích tài chính</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <p className="text-xs text-slate-400">Tổng phụ</p>
                                    <p className="text-sm text-slate-300 font-semibold">{invoice.subtotal?.toLocaleString("vi-VN")} đ</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Phí phát sinh</p>
                                    <p className="text-sm text-yellow-400 font-semibold">+{surchargesTotal.toLocaleString("vi-VN")} đ</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Giảm giá</p>
                                    <p className="text-sm text-blue-400 font-semibold">-{invoice.discountTotal?.toLocaleString("vi-VN") || 0} đ</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400">Tiền cọc áp dụng</p>
                                    <p className="text-sm text-purple-400 font-semibold">-{invoice.depositApplied?.toLocaleString("vi-VN") || 0} đ</p>
                                </div>
                            </div>
                            {(invoice.vatAmount || 0) > 0 && (
                                <div className="mt-2 pt-2 border-t border-slate-800">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-slate-400">VAT ({invoice.vatPercent || 0}%):</span>
                                        <span className="text-sm text-slate-300 font-semibold">+{invoice.vatAmount?.toLocaleString("vi-VN") || 0} đ</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {(invoice.vatPercent || invoice.vatAmount) && (
                            <div className="grid grid-cols-2 gap-4 mt-2 pt-2 border-t border-slate-800">
                                {invoice.vatPercent && (
                                    <div>
                                        <p className="text-xs text-slate-400">VAT %</p>
                                        <p className="text-sm text-slate-300">{invoice.vatPercent}%</p>
                                    </div>
                                )}
                                {invoice.vatAmount && (
                                    <div>
                                        <p className="text-xs text-slate-400">VAT</p>
                                        <p className="text-sm text-slate-300">{invoice.vatAmount.toLocaleString("vi-VN")} đ</p>
                                    </div>
                                )}
                            </div>
                        )}
                        {invoice.notes && (
                            <p className="text-xs text-slate-400">
                                <b>Ghi chú:</b> {invoice.notes}
                            </p>
                        )}
                        {remaining > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <button
                                    onClick={() => setShowPaymentModal(true)}
                                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Thanh toán ({remaining.toLocaleString("vi-VN")} đ)
                                </button>
                            </div>
                        )}
                    </section>

                    {/* Surcharges */}
                    {surcharges.length > 0 && (
                        <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <h3 className="text-sm font-semibold text-blue-300 mb-2">
                                Phí phát sinh ({surcharges.length})
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {surcharges.map((s: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs bg-slate-950/60 p-2 rounded border border-slate-800"
                                    >
                                        <div>
                                            <p className="font-semibold">{s.name}</p>
                                            {s.surchargeType && (
                                                <p className="text-xs text-blue-400">Loại: {s.surchargeType}</p>
                                            )}
                                            {s.description && <p className="text-slate-400">{s.description}</p>}
                                            {s.occurredAt && (
                                                <p className="text-xs text-slate-500">
                                                    Xảy ra: {new Date(s.occurredAt).toLocaleDateString("vi-VN")}
                                                </p>
                                            )}
                                            {s.evidenceUrl && (
                                                <a href={s.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                                                    Xem bằng chứng
                                                </a>
                                            )}
                                            {s.status && (
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
                                                    s.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                                                    "bg-slate-500/20 text-slate-400"
                                                }`}>
                                                    {s.status === "ACTIVE" ? "Hoạt động" : s.status === "INACTIVE" ? "Không hoạt động" : s.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold text-yellow-400">
                                            {s.amount?.toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Payments */}
                    {payments.length > 0 && (
                        <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <h3 className="text-sm font-semibold text-blue-300 mb-3">
                                Lịch sử thanh toán ({payments.length})
                            </h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {payments.map((p: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-start text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                    p.method === 'CASH' ? 'bg-purple-500/20 text-purple-400' :
                                                    p.method === 'STRIPE' || p.method === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                    {translateStatus(p.method, 'payment')}
                                                </span>
                                                {p.status && (
                                                    <span className={`px-2 py-0.5 rounded text-xs ${
                                                        p.status === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-slate-500/20 text-slate-400'
                                                    }`}>
                                                        {translateStatus(p.status, 'payment')}
                                                    </span>
                                                )}
                                            </div>
                                            {p.referenceNo && (
                                                <p className="text-slate-400 text-xs mb-1">Mã tham chiếu: <span className="text-slate-300">{p.referenceNo}</span></p>
                                            )}
                                            {p.note && (
                                                <p className="text-slate-500 text-xs mb-1">{p.note}</p>
                                            )}
                                            <p className="text-slate-500 text-xs">
                                                {p.paidAt ? new Date(p.paidAt).toLocaleDateString("vi-VN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                }) : p.createdAt ? new Date(p.createdAt).toLocaleDateString("vi-VN") : ""}
                                            </p>
                                        </div>
                                        <p className="font-bold text-emerald-400 text-base ml-4">
                                            {p.amount?.toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-800">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-300 font-semibold">Tổng đã thanh toán:</span>
                                    <span className="text-blue-400 font-bold text-lg">
                                        {paymentsTotal.toLocaleString("vi-VN")} đ
                                    </span>
                                </div>
                                {remaining > 0 && (
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-sm text-slate-300">Còn lại:</span>
                                        <span className="text-red-400 font-bold">
                                            {remaining.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && (
                <CreatePaymentModal
                    invoice={invoice}
                    remaining={remaining}
                    onClose={() => setShowPaymentModal(false)}
                    onSuccess={refreshInvoice}
                />
            )}
        </div>
    );
}


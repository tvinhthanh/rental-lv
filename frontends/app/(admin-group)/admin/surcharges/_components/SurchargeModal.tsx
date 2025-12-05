"use client";

import { useState, useEffect } from "react";
import { billingService } from "@/services/billing.service";

type SurchargeModalProps = {
    surcharge: any;
    onClose: () => void;
};

export default function SurchargeModal({ surcharge, onClose }: SurchargeModalProps) {
    const [invoice, setInvoice] = useState<any | null>(surcharge?.invoice || null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Nếu surcharge đã có invoice thì dùng luôn, không cần load lại
        if (surcharge?.invoice) {
            setInvoice(surcharge.invoice);
            return;
        }
        
        // Chỉ load invoice nếu chưa có và có invoiceId
        if (!surcharge?.invoiceId) return;
        
        async function loadInvoice() {
            try {
                setLoading(true);
                const res = await billingService.invoice(surcharge.invoiceId);
                setInvoice(res?.data || res);
            } catch (e) {
                console.error("Load invoice failed", e);
            } finally {
                setLoading(false);
            }
        }
        loadInvoice();
    }, [surcharge?.invoiceId, surcharge?.invoice]);

    if (!surcharge) return null;

    const invoiceData = invoice || surcharge.invoice;
    const booking = invoiceData?.booking;
    const customer = booking?.customer || invoiceData?.customer;
    const vehicle = booking?.vehicle;

    const typeLabels: Record<string, string> = {
        FUEL_SHORTAGE: "Thiếu nhiên liệu",
        OVER_MILEAGE: "Vượt km",
        DAMAGE: "Hư hỏng",
        OTHER: "Khác",
    };

    const typeText = typeLabels[surcharge.surchargeType] || surcharge.surchargeType || "OTHER";

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-3xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Chi tiết phụ phí
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Mã HĐ: {invoiceData?.invoiceNo || "—"} • Booking: {booking?.bookingCode || "—"}
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
                    {/* Surcharge Info */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-3">
                        <h3 className="text-sm font-semibold text-yellow-300 mb-3">
                            Thông tin phụ phí
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">Tên phụ phí</p>
                                <p className="text-lg font-bold text-yellow-400">
                                    {surcharge.name || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Loại phụ phí</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    surcharge.surchargeType === "FUEL_SHORTAGE" ? "bg-yellow-500/20 text-yellow-400" :
                                    surcharge.surchargeType === "OVER_MILEAGE" ? "bg-blue-500/20 text-blue-400" :
                                    surcharge.surchargeType === "DAMAGE" ? "bg-red-500/20 text-red-400" :
                                    "bg-slate-500/20 text-slate-400"
                                }`}>
                                    {typeText}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Số tiền</p>
                                <p className="text-xl font-bold text-yellow-400">
                                    {surcharge.amount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Trạng thái</p>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                    surcharge.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                                    "bg-slate-500/20 text-slate-400"
                                }`}>
                                    {surcharge.status || "ACTIVE"}
                                </span>
                            </div>
                            {surcharge.occurredAt && (
                                <div>
                                    <p className="text-xs text-slate-400">Ngày xảy ra</p>
                                    <p className="text-sm text-slate-300">
                                        {new Date(surcharge.occurredAt).toLocaleDateString("vi-VN", {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                        {surcharge.description && (
                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-xs text-slate-400 mb-1">Mô tả</p>
                                <p className="text-sm text-slate-300 whitespace-pre-wrap">{surcharge.description}</p>
                            </div>
                        )}
                        {surcharge.evidenceUrl && (
                            <div className="pt-2 border-t border-slate-800">
                                <p className="text-xs text-slate-400 mb-2">Bằng chứng</p>
                                <a 
                                    href={surcharge.evidenceUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="inline-block px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                                >
                                    📷 Xem ảnh bằng chứng
                                </a>
                            </div>
                        )}
                    </section>

                    {/* Customer */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin khách hàng
                        </h3>
                        <p><b>Họ tên:</b> {customer?.fullName || "—"}</p>
                        <p><b>Điện thoại:</b> {customer?.phone || "—"}</p>
                        <p><b>Email:</b> {customer?.email || "—"}</p>
                        <p><b>Booking:</b> {booking?.bookingCode || "—"}</p>
                    </section>

                    {/* Vehicle */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin xe
                        </h3>
                        <p><b>Tên xe:</b> {vehicle?.name || "—"}</p>
                        <p><b>Biển số:</b> {vehicle?.licensePlate || "—"}</p>
                        <p><b>Loại xe:</b> {vehicle?.vehicleType || "—"}</p>
                        <p><b>Màu:</b> {vehicle?.color || "—"}</p>
                    </section>

                    {/* Invoice Info */}
                    {invoiceData && (() => {
                        const paymentsTotal = invoiceData.payments && Array.isArray(invoiceData.payments) 
                            ? invoiceData.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
                            : 0;
                        const remaining = (invoiceData.totalAmount || 0) - paymentsTotal;
                        
                        return (
                            <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                                <h3 className="text-sm font-semibold text-blue-300 mb-1">
                                    Thông tin hóa đơn
                                </h3>
                                <div className={`grid gap-4 ${paymentsTotal > 0 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2'}`}>
                                    <div>
                                        <p className="text-xs text-slate-400">Tổng tiền</p>
                                        <p className="font-semibold text-emerald-400">
                                            {invoiceData.totalAmount?.toLocaleString("vi-VN")} đ
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
                                            invoiceData.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                            invoiceData.status === "UNPAID" ? "bg-red-500/20 text-red-400" :
                                            "bg-slate-500/20 text-slate-400"
                                        }`}>
                                            {invoiceData.status}
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


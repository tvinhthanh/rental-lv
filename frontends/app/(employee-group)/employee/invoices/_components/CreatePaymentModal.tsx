"use client";

import { useState, FormEvent } from "react";
import { billingService } from "@/services/billing.service";

type CreatePaymentModalProps = {
    invoice: any;
    remaining: number;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreatePaymentModal({ invoice, remaining, onClose, onSuccess }: CreatePaymentModalProps) {
    const [method, setMethod] = useState<string>("CASH");
    const [amount, setAmount] = useState<string>(remaining > 0 ? String(remaining) : "");
    const [referenceNo, setReferenceNo] = useState<string>("");
    const [note, setNote] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};
        
        if (!method) {
            newErrors.method = "Vui lòng chọn phương thức thanh toán";
        }
        
        if (!amount || Number(amount) <= 0) {
            newErrors.amount = "Vui lòng nhập số tiền hợp lệ";
        } else if (Number(amount) > remaining) {
            newErrors.amount = `Số tiền không được vượt quá ${remaining.toLocaleString("vi-VN")} đ`;
        }

        setError(Object.keys(newErrors).length > 0 ? Object.values(newErrors)[0] : null);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setError(null);
        setSuccess(null);
        setSubmitting(true);

        try {
            const payload: any = {
                invoiceId: invoice.id,
                method,
                amount: Number(amount),
            };

            if (referenceNo) payload.referenceNo = referenceNo;
            if (note) payload.note = note;

            await billingService.pay(payload);

            setSuccess("Tạo thanh toán thành công");
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (e: any) {
            console.error("Create payment failed", e);
            setError(e?.message || "Tạo thanh toán thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Thanh toán hóa đơn
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Hóa đơn: {invoice?.invoiceNo} • Booking: {invoice?.booking?.bookingCode}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Thông tin số tiền còn lại */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-400">Số tiền còn lại</p>
                                <p className={`text-2xl font-bold ${remaining > 0 ? "text-red-400" : "text-emerald-400"}`}>
                                    {remaining.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-400">Tổng hóa đơn</p>
                                <p className="text-lg font-semibold text-emerald-400">
                                    {invoice?.totalAmount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Phương thức thanh toán */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Phương thức thanh toán <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={method}
                            onChange={(e) => {
                                setMethod(e.target.value);
                                if (error) setError(null);
                            }}
                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                        >
                            <option value="CASH">Tiền mặt</option>
                            <option value="BANK_TRANSFER">Chuyển khoản</option>
                            <option value="CREDIT_CARD">Thẻ tín dụng</option>
                            <option value="DEBIT_CARD">Thẻ ghi nợ</option>
                            <option value="E_WALLET">Ví điện tử</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>

                    {/* Số tiền */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Số tiền thanh toán <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                if (error) setError(null);
                            }}
                            min="0"
                            max={remaining}
                            step="1000"
                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                            placeholder={`Tối đa: ${remaining.toLocaleString("vi-VN")} đ`}
                        />
                        <p className="mt-1 text-xs text-slate-400">
                            Số tiền tối đa: {remaining.toLocaleString("vi-VN")} đ
                        </p>
                    </div>

                    {/* Mã tham chiếu */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Mã tham chiếu
                        </label>
                        <input
                            type="text"
                            value={referenceNo}
                            onChange={(e) => setReferenceNo(e.target.value)}
                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                            placeholder="VD: REF123456, Transaction ID..."
                        />
                    </div>

                    {/* Ghi chú */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Ghi chú
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                            placeholder="Ghi chú về thanh toán..."
                        />
                    </div>

                    {success && (
                        <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/50">
                            <p className="text-sm text-emerald-400">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                            <p className="text-sm text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                            disabled={submitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || remaining <= 0}
                            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white"
                        >
                            {submitting ? "Đang lưu..." : "Xác nhận thanh toán"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


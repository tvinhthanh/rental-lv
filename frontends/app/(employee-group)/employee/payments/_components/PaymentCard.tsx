import { CreditCard } from "lucide-react";
import { translateStatus } from "@/lib/utils";

export default function PaymentCard({ payment, onClick }: any) {
    const methodColors: Record<string, string> = {
        CASH: "bg-green-500/20 text-green-400 ring-green-500/50",
        BANK_TRANSFER: "bg-blue-500/20 text-blue-400 ring-blue-500/50",
        CREDIT_CARD: "bg-purple-500/20 text-purple-400 ring-purple-500/50",
        DEBIT_CARD: "bg-indigo-500/20 text-indigo-400 ring-indigo-500/50",
        E_WALLET: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/50",
        OTHER: "bg-slate-500/20 text-slate-400 ring-slate-500/50",
    };

    const methodLabel: Record<string, string> = {
        CASH: "Tiền mặt",
        BANK_TRANSFER: "Chuyển khoản",
        CREDIT_CARD: "Thẻ tín dụng",
        DEBIT_CARD: "Thẻ ghi nợ",
        E_WALLET: "Ví điện tử",
        OTHER: "Khác",
    };

    const methodColor = methodColors[payment.method] || methodColors.OTHER;
    const methodText = methodLabel[payment.method] || payment.method;

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-emerald-500/70 hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]"
        >
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-500/0 opacity-0 blur-sm transition group-hover:border-emerald-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-emerald-600/20 via-slate-900/60 to-blue-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-emerald-300 ring-1 ring-emerald-400/30">
                        <CreditCard className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Mã Hóa Đơn
                        </span>
                        <span className="text-sm font-semibold text-emerald-300">
                            {payment.invoiceNo || "—"}
                        </span>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${methodColor}`}>
                    {methodText}
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Booking & Customer row */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Booking
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {payment.bookingCode || "—"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Khách hàng
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {payment.customerName || "—"}
                        </p>
                    </div>
                </div>

                {/* Vehicle info */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Xe
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {payment.vehicleName || "—"}
                    </p>
                    {payment.licensePlate && (
                        <p className="text-[11px] text-slate-400">
                            {payment.licensePlate}
                        </p>
                    )}
                </div>

                {/* Payment details */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Ngày thanh toán
                        </p>
                        <p className="text-[11px] text-slate-300">
                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("vi-VN", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }) : "—"}
                        </p>
                        {payment.paidAt && (
                            <p className="text-[10px] text-slate-500">
                                {new Date(payment.paidAt).toLocaleTimeString("vi-VN", {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Trạng thái
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            payment.status === "SUCCESS" ? "bg-emerald-500/20 text-emerald-400" :
                            payment.status === "FAILED" ? "bg-red-500/20 text-red-400" :
                            "bg-slate-500/20 text-slate-400"
                        }`}>
                            {translateStatus(payment.status || "SUCCESS", 'payment')}
                        </span>
                    </div>
                </div>

                {/* Reference & Amount */}
                <div className="flex items-end justify-between border-t border-slate-800/80 pt-3">
                    <div className="text-xs text-slate-400 flex-1">
                        {payment.referenceNo && (
                            <>
                                <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                                    Mã tham chiếu
                                </p>
                                <p className="max-w-[170px] truncate text-[11px] text-slate-300">
                                    {payment.referenceNo}
                                </p>
                            </>
                        )}
                        {payment.note && (
                            <p className="max-w-[170px] truncate text-[10px] text-slate-500 mt-1">
                                {payment.note}
                            </p>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Số tiền
                        </p>
                        <p className="text-lg font-extrabold text-emerald-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
                            {payment.amount?.toLocaleString("vi-VN")} đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


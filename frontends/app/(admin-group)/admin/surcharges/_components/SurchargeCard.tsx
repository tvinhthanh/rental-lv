import { AlertTriangle } from "lucide-react";

export default function SurchargeCard({ surcharge, onClick }: any) {
    const invoice = surcharge.invoice;
    const booking = invoice?.booking;
    const customer = booking?.customer || invoice?.customer;
    const vehicle = booking?.vehicle;

    const typeColors: Record<string, string> = {
        FUEL_SHORTAGE: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/50",
        OVER_MILEAGE: "bg-blue-500/20 text-blue-400 ring-blue-500/50",
        DAMAGE: "bg-red-500/20 text-red-400 ring-red-500/50",
        OTHER: "bg-slate-500/20 text-slate-400 ring-slate-500/50",
    };

    const typeLabels: Record<string, string> = {
        FUEL_SHORTAGE: "Thiếu nhiên liệu",
        OVER_MILEAGE: "Vượt km",
        DAMAGE: "Hư hỏng",
        OTHER: "Khác",
    };

    const typeColor = typeColors[surcharge.surchargeType] || typeColors.OTHER;
    const typeText = typeLabels[surcharge.surchargeType] || surcharge.surchargeType || "OTHER";

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-yellow-500/70 hover:shadow-[0_0_35px_rgba(234,179,8,0.45)]"
        >
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-yellow-500/0 opacity-0 blur-sm transition group-hover:border-yellow-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-yellow-600/20 via-slate-900/60 to-red-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-yellow-300 ring-1 ring-yellow-400/30">
                        <AlertTriangle className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Mã Hóa Đơn
                        </span>
                        <span className="text-sm font-semibold text-yellow-300">
                            {invoice?.invoiceNo || "—"}
                        </span>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${typeColor}`}>
                    {typeText}
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
                            {booking?.bookingCode || "—"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Khách hàng
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {customer?.fullName || "—"}
                        </p>
                        {customer?.phone && (
                            <p className="text-[10px] text-slate-400 truncate">
                                {customer.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Vehicle info */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Xe
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {vehicle?.name || "—"}
                    </p>
                    {vehicle?.licensePlate && (
                        <p className="text-[11px] text-slate-400">
                            {vehicle.licensePlate}
                        </p>
                    )}
                </div>

                {/* Surcharge name & description */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Tên phụ phí
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {surcharge.name || "—"}
                    </p>
                    {surcharge.description && (
                        <p className="text-[10px] text-slate-400 line-clamp-2">
                            {surcharge.description}
                        </p>
                    )}
                </div>

                {/* Date & Status */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Ngày xảy ra
                        </p>
                        <p className="text-[11px] text-slate-300">
                            {surcharge.occurredAt ? new Date(surcharge.occurredAt).toLocaleDateString("vi-VN", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            }) : "—"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Trạng thái
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                            surcharge.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" :
                            "bg-slate-500/20 text-slate-400"
                        }`}>
                            {surcharge.status || "ACTIVE"}
                        </span>
                    </div>
                </div>

                {/* Amount */}
                <div className="flex items-end justify-between border-t border-slate-800/80 pt-3">
                    <div className="text-xs text-slate-400 flex-1">
                        {surcharge.evidenceUrl && (
                            <>
                                <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                                    Bằng chứng
                                </p>
                                <a 
                                    href={surcharge.evidenceUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-[11px] text-blue-400 hover:underline truncate block"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Xem ảnh
                                </a>
                            </>
                        )}
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Số tiền
                        </p>
                        <p className="text-lg font-extrabold text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                            {surcharge.amount?.toLocaleString("vi-VN")} đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}


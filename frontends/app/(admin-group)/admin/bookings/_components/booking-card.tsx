import { getPlaceholderImage } from "@/lib/image-placeholder";
export default function BookingCard({ booking, onClick }: any) {
    const vehicle = booking.vehicle;
    const customer = booking.customer;
    const branch = booking.branch ?? vehicle?.branch;

    const image =
        Array.isArray(vehicle?.photos) && vehicle.photos.length > 0
            ? vehicle.photos[0]
            : getPlaceholderImage();

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-[0_0_35px_rgba(56,189,248,0.45)]"
        >
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-500/0 opacity-0 blur-sm transition group-hover:border-blue-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-blue-600/20 via-slate-900/60 to-purple-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-xs font-semibold text-blue-300 ring-1 ring-blue-400/30">
                        BK
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Booking Code
                        </span>
                        <span className="text-sm font-semibold text-sky-300">
                            {booking.bookingCode}
                        </span>
                    </div>
                </div>

                <div className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300 ring-1 ring-emerald-500/50">
                    {booking.status}
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Vehicle row */}
                <div className="flex gap-3">
                    <div className="overflow-hidden rounded-xl border border-slate-800/80">
                        <img
                            src={image}
                            alt={vehicle?.name}
                            className="h-16 w-20 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-100">
                                {vehicle?.name}{" "}
                                <span className="text-xs text-slate-400">
                                    ({vehicle?.licensePlate})
                                </span>
                            </p>
                            <p className="text-xs text-slate-400">
                                {branch?.name} • {vehicle?.vehicleType}
                            </p>
                        </div>

                        <p className="text-xs text-slate-500">
                            Màu: <span className="text-slate-300">{vehicle?.color || "—"}</span> •
                            Ghế:{" "}
                            <span className="text-slate-300">
                                {vehicle?.seatCount ?? "—"}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Customer + date */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Khách hàng
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {customer?.fullName || "Khách lẻ"}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">
                            {customer?.phone || customer?.email || "Không có thông tin"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Thời gian
                        </p>
                        <p className="text-[11px] text-slate-300">
                            Nhận:{" "}
                            <span className="font-medium text-sky-300">
                                {new Date(booking.pickupDate).toLocaleDateString("vi-VN")}
                            </span>
                        </p>
                        <p className="text-[11px] text-slate-300">
                            Trả:{" "}
                            <span className="font-medium text-rose-300">
                                {new Date(booking.returnDate).toLocaleDateString("vi-VN")}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Amount & branch */}
                <div className="flex items-end justify-between border-t border-slate-800/80 pt-3">
                    <div className="text-xs text-slate-400">
                        <p className="mb-0.5 text-[10px] uppercase tracking-wide text-slate-500">
                            Chi nhánh
                        </p>
                        <p className="max-w-[170px] truncate text-[11px] text-slate-300">
                            {branch?.name}
                        </p>
                        <p className="max-w-[170px] truncate text-[10px] text-slate-500">
                            {branch?.address}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Tổng tiền
                        </p>
                        <p className="text-lg font-extrabold text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
                            {booking.totalAmount?.toLocaleString("vi-VN")} đ
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

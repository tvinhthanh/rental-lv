import { Car, MapPin, Tag } from "lucide-react";

export default function VehicleCard({ vehicle, onEdit, onDelete }: any) {
    const statusColors: Record<string, string> = {
        AVAILABLE: "bg-green-500/20 text-green-400 ring-green-500/50",
        RENTED: "bg-blue-500/20 text-blue-400 ring-blue-500/50",
        MAINTENANCE: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/50",
        OUT_OF_SERVICE: "bg-red-500/20 text-red-400 ring-red-500/50",
    };

    const statusLabels: Record<string, string> = {
        AVAILABLE: "Sẵn sàng",
        RENTED: "Đang thuê",
        MAINTENANCE: "Bảo trì",
        OUT_OF_SERVICE: "Ngừng hoạt động",
    };

    const statusColor = statusColors[vehicle.status] || statusColors.AVAILABLE;
    const statusText = statusLabels[vehicle.status] || vehicle.status || "AVAILABLE";

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-blue-500/70 hover:shadow-[0_0_35px_rgba(59,130,246,0.45)]">
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-blue-500/0 opacity-0 blur-sm transition group-hover:border-blue-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-blue-600/20 via-slate-900/60 to-purple-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-blue-300 ring-1 ring-blue-400/30">
                        <Car className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Biển số xe
                        </span>
                        <span className="text-sm font-semibold text-blue-300">
                            {vehicle.licensePlate || "—"}
                        </span>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Vehicle Name & Model */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Tên xe
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {vehicle.name || "—"}
                    </p>
                    {vehicle.model && (
                        <p className="text-[11px] text-slate-400">
                            {vehicle.model}
                        </p>
                    )}
                </div>

                {/* Brand & Category */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Thương hiệu
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {vehicle.brand?.name || vehicle.brandName || "—"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Danh mục
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {vehicle.category?.name || vehicle.categoryName || "—"}
                        </p>
                    </div>
                </div>

                {/* Branch */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Chi nhánh
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {vehicle.branch?.name || vehicle.branchName || "—"}
                    </p>
                </div>

                {/* Pricing */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Giá thuê
                    </p>
                    {vehicle.overridePriceEnabled ? (
                        <div>
                            <p className="text-sm font-medium text-emerald-400">
                                Tùy chỉnh: {vehicle.overrideDailyRate?.toLocaleString("vi-VN")} đ/ngày
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400">
                            Theo bảng giá
                        </p>
                    )}
                </div>

                {/* Year & Mileage */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    {vehicle.year && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                Năm sản xuất
                            </p>
                            <p className="text-[11px] text-slate-300">
                                {vehicle.year}
                            </p>
                        </div>
                    )}

                    {vehicle.mileage !== undefined && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                Số km
                            </p>
                            <p className="text-[11px] text-slate-300">
                                {vehicle.mileage?.toLocaleString("vi-VN")} km
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-slate-800/80 pt-3">
                    <div className="text-xs text-slate-400">
                        {vehicle.imageUrl && (
                            <img 
                                src={vehicle.imageUrl} 
                                alt={vehicle.name}
                                className="w-16 h-12 object-cover rounded-lg border border-slate-700"
                            />
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(vehicle);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors"
                        >
                            Sửa
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(vehicle.id);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-colors"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


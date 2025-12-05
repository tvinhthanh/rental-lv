"use client";

import { useEffect, useState } from "react";
import { maintenanceService } from "@/services/maintenance.service";
import { toast } from "sonner";

export default function MaintenanceModal({ vehicle, maintenance, onClose }: any) {
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Load maintenance history for this vehicle
    useEffect(() => {
        if (!vehicle?.id) return;

        async function load() {
            try {
                const res = await maintenanceService.list(vehicle.id);
                setRecords(res?.data || res || []);
            } catch (err) {
                console.error("Load maintenance history failed:", err);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [vehicle]);

    // PATCH status = DONE
    const handleComplete = async (recordId: string) => {
        try {
            await maintenanceService.update(recordId, { status: "DONE" });

            toast.success("Đã hoàn tất bảo dưỡng");

            // Reload list
            const res = await maintenanceService.list(vehicle.id);
            setRecords(res?.data || res || []);
        } catch (err) {
            console.error(err);
            toast.error("Không thể cập nhật");
        }
    };

    if (!vehicle) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6">
            <div className="bg-slate-900 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex-shrink-0 mb-4 sm:mb-6">
                    <div className="flex items-start justify-between pr-8">
                        <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-bold text-white mb-1">
                    Lịch sử bảo dưỡng xe
                </h2>
                            <p className="text-sm sm:text-base text-gray-300">
                    {vehicle.name} – {vehicle.licensePlate}
                </p>
                        </div>
                    </div>
                <button
                    onClick={onClose}
                        className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-white text-xl sm:text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800 transition-colors"
                        aria-label="Đóng"
                >
                    ✕
                </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-gray-400 text-sm sm:text-base">Đang tải...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <p className="text-gray-400 text-sm sm:text-base">Chưa có lịch sử bảo dưỡng.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4 h-full overflow-y-auto pr-1 sm:pr-2">
                            {records.map((r) => (
                                <div
                                    key={r.id}
                                    className="border border-slate-700 rounded-lg p-3 sm:p-4 bg-slate-800"
                                >
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                                        {r.title}
                                    </h3>

                                    <p className="text-xs sm:text-sm text-gray-300 mb-1">
                                        <b>Ngày: </b>
                                        {new Date(r.maintenanceDate).toLocaleDateString("vi-VN")}
                                    </p>

                                    {r.description && (
                                        <p className="text-xs sm:text-sm text-gray-300 mt-2 mb-2">
                                            <b>Ghi chú:</b> {r.description}
                                        </p>
                                    )}

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mt-3">
                                        <p className="text-xs sm:text-sm text-gray-300">
                                            <b>Trạng thái: </b>
                                            <span className={
                                                r.status === "PENDING"
                                                    ? "text-orange-400"
                                                    : "text-green-400"
                                            }>
                                                {r.status}
                                            </span>
                                        </p>

                                        {r.status === "PENDING" && (
                                            <button
                                                onClick={() => handleComplete(r.id)}
                                                className="w-full sm:w-auto mt-2 sm:mt-0 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-500 active:bg-green-700 rounded-lg text-white text-sm sm:text-base font-medium transition-colors"
                                            >
                                                Hoàn tất bảo dưỡng
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

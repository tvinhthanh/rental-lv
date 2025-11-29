"use client";

import { useEffect, useState } from "react";
import { maintenanceService } from "@/services/maintenance.service";
import { toast } from "sonner";

export default function MaintenanceModal({ vehicle, onClose }: any) {
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
        <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-700 w-full max-w-2xl relative">

                {/* Header */}
                <h2 className="text-xl font-bold text-white mb-1">
                    Lịch sử bảo dưỡng xe
                </h2>
                <p className="text-gray-300 mb-4">
                    {vehicle.name} – {vehicle.licensePlate}
                </p>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                    ✕
                </button>

                {/* Body */}
                {loading ? (
                    <p className="text-gray-400">Đang tải...</p>
                ) : records.length === 0 ? (
                    <p className="text-gray-400">Chưa có lịch sử bảo dưỡng.</p>
                ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">

                        {records.map((r) => (
                            <div
                                key={r.id}
                                className="border border-slate-700 rounded-lg p-4 bg-slate-800"
                            >
                                <h3 className="text-lg font-semibold text-white">
                                    {r.title}
                                </h3>

                                <p className="text-gray-300 mt-1">
                                    <b>Ngày: </b>
                                    {new Date(r.maintenanceDate).toLocaleDateString("vi-VN")}
                                </p>

                                {r.description && (
                                    <p className="text-gray-300 mt-1">
                                        <b>Ghi chú:</b> {r.description}
                                    </p>
                                )}

                                <p className="text-gray-300 mt-2">
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
                                        className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white"
                                    >
                                        Hoàn tất bảo dưỡng
                                    </button>
                                )}
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}

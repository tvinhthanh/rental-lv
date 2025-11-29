"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { maintenanceService } from "@/services/maintenance.service";
import { MAINTENANCE_REASONS } from "@/constants/maintenance-reasons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateMaintenancePage() {
    const params = useSearchParams();
    const vehicleId = params.get("vehicleId");
    const router = useRouter();
    const [vehicle, setVehicle] = useState<any>(null);

    // FORM STATE
    const [reasons, setReasons] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [maintenanceDate, setMaintenanceDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    useEffect(() => {
        if (!vehicleId) return;

        vehicleService.get(vehicleId).then((res) => {
            setVehicle(res?.data || res);
        });
    }, [vehicleId]);

    // Handle multi-select
    const toggleReason = (reason: string) => {
        setReasons((prev) =>
            prev.includes(reason)
                ? prev.filter((r) => r !== reason)
                : [...prev, reason]
        );
    };

    const handleCreate = async () => {
        if (!vehicle) return;

        if (reasons.length === 0) {
            toast.error("Vui lòng chọn ít nhất 1 lý do bảo dưỡng");
            return;
        }

        try {
            await maintenanceService.create({
                vehicleId: vehicle.id,
                // Title sẽ là các lý do gộp lại
                title: reasons.join(", "),
                description,
                maintenanceDate,
                status: "PENDING",
                performedBy: null,
            });

            toast.success("Tạo phiếu bảo dưỡng thành công!");
            router.push(`/employee/maintenance`);
        } catch (err) {
            console.error(err);
            toast.error("Không thể tạo phiếu bảo dưỡng");
        }
    };

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-4">
                Tạo phiếu bảo dưỡng xe
            </h1>

            {!vehicle ? (
                <p className="text-gray-400">Đang tải thông tin xe...</p>
            ) : (
                <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                    <h2 className="text-xl font-semibold mb-3">
                        Xe: {vehicle.name}
                    </h2>

                    <p className="text-gray-300">
                        <b>Biển số: </b> {vehicle.licensePlate}
                    </p>
                    <p className="text-gray-300 mt-2">
                        <b>Hãng: </b> {vehicle.brand?.name}
                    </p>
                    <p className="text-gray-300 mt-2">
                        <b>Loại: </b> {vehicle.category?.name}
                    </p>

                    <hr className="my-4 border-slate-700" />

                    {/* MULTI SELECT */}
                    <div className="space-y-3">
                        <label className="text-sm text-gray-400">
                            Lý do bảo dưỡng (chọn nhiều):
                        </label>

                        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 max-h-60 overflow-y-auto">
                            {MAINTENANCE_REASONS.map((reason) => (
                                <label
                                    key={reason}
                                    className="flex items-center gap-2 py-1 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={reasons.includes(reason)}
                                        onChange={() => toggleReason(reason)}
                                        className="w-4 h-4 accent-orange-500"
                                    />
                                    <span className="text-gray-300">
                                        {reason}
                                    </span>
                                </label>
                            ))}
                        </div>

                        {/* Description */}
                        <label className="block text-sm text-gray-400 mt-3">
                            Ghi chú chi tiết:
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                            placeholder="Ví dụ: kiểm tra thắng trước, vệ sinh nội thất..."
                        />

                        {/* Date */}
                        <label className="block text-sm text-gray-400 mt-3">
                            Ngày bảo dưỡng:
                        </label>
                        <input
                            type="date"
                            value={maintenanceDate}
                            onChange={(e) => setMaintenanceDate(e.target.value)}
                            className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                        />
                    </div>

                    <button
                        onClick={handleCreate}
                        className="mt-6 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-white"
                    >
                        Xác nhận tạo phiếu bảo dưỡng
                    </button>
                </div>
            )}
        </div>
    );
}

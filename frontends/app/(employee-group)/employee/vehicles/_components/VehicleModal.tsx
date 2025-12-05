"use client";

import { getPlaceholderImage } from "@/lib/image-placeholder";
import { useRouter } from "next/navigation";

export default function VehicleModal({ vehicle, onClose }: any) {
    const router = useRouter();

    if (!vehicle) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999]">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-xl">

                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">
                        Xe: {vehicle.name}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Image */}
                <img
                    src={vehicle.photos?.[0] || getPlaceholderImage(400, 300)}
                    className="w-full h-48 object-cover rounded-lg mb-4 border border-slate-700"
                />

                {/* Info */}
                <div className="space-y-2 text-gray-300">
                    <p><b>Biển số:</b> {vehicle.licensePlate}</p>
                    <p><b>Loại xe:</b> {vehicle.category?.name}</p>
                    <p><b>Model:</b> {vehicle.model} ({vehicle.year})</p>
                    <p><b>Màu:</b> {vehicle.color}</p>
                    <p><b>Số ghế:</b> {vehicle.seatCount}</p>
                    <p><b>Hộp số:</b> {vehicle.transmission}</p>

                    <p className="text-blue-400 font-bold text-lg">
                        Giá thuê: {vehicle.priceList?.dailyRate?.toLocaleString("vi-VN")} đ/ngày
                    </p>

                    <p>
                        <b>Trạng thái:</b>{" "}
                        <span className="text-yellow-300 font-semibold">
                            {vehicle.status}
                        </span>
                    </p>
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={() => {
                            router.push(`/employee/bookings/create?vehicleId=${vehicle.id}`);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        Tạo booking
                    </button>

                    <button
                        onClick={() => {
                            router.push(`/employee/maintenance/create?vehicleId=${vehicle.id}`);
                        }}
                        className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white"
                    >
                        Đưa xe bảo dưỡng
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
}

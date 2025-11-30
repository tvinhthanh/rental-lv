"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { vehicleService } from "@/services/vehicle.service";

import { Suspense } from "react";

function CreateBookingContent() {
    const params = useSearchParams();
    const vehicleId = params.get("vehicleId");

    const [vehicle, setVehicle] = useState<any>(null);

    useEffect(() => {
        if (!vehicleId) return;

        vehicleService.get(vehicleId).then((res) => {
            setVehicle(res?.data || res);
        });
    }, [vehicleId]);

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-4">
                Tạo booking mới
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
                        <b>Giá thuê: </b>{" "}
                        {vehicle.priceList?.dailyRate?.toLocaleString("vi-VN")} đ/ngày
                    </p>

                    <hr className="my-4 border-slate-700" />

                    <div className="space-y-3">
                        <label className="block text-sm text-gray-400">
                            Ngày nhận xe:
                        </label>
                        <input
                            type="date"
                            className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                        />

                        <label className="block text-sm text-gray-400">
                            Ngày trả xe:
                        </label>
                        <input
                            type="date"
                            className="bg-slate-800 p-2 rounded w-full border border-slate-700"
                        />
                    </div>

                    <button className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white">
                        Xác nhận tạo booking
                    </button>
                </div>
            )}
        </div>
    );
}

export default function CreateBookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateBookingContent />
        </Suspense>
    );
}

"use client";

import { useEffect, useState } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { toWebP, getImageLoading } from "@/lib/image-utils";
import { notFound, useParams, useRouter } from "next/navigation";

export default function CarDetailPage() {
    const { slug } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const { formatVND } = useFormatVND();
    const router = useRouter();

    useEffect(() => {
        if (!slug) return;

        vehicleService.getBySlug(slug as string).then((res) => {
            if (!res) return notFound();

            // 🟦 Normalize mọi dạng response
            let data = res;

            if (res?.items && Array.isArray(res.items)) {
                data = res.items[0] || null;
            }

            if (res?.data) {
                data = res.data;
            }

            if (!data) return notFound();

            setVehicle(data);
        });
    }, [slug]);

    if (!vehicle) {
        return (
            <div className="p-10 text-center text-gray-400">
                Đang tải thông tin xe...
            </div>
        );
    }

    const price = vehicle?.priceList?.dailyRate
        ? formatVND(vehicle.priceList.dailyRate) + " / ngày"
        : "—";

    return (
        <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-200">
            <div className="grid md:grid-cols-2 gap-10">

                {/* IMAGE SECTION */}
                <div>
                    <img
                        src={toWebP(vehicle.photos?.[0])}
                        alt={vehicle.name}
                        className="w-full h-[420px] object-cover rounded-xl shadow"
                        loading={getImageLoading(true)}
                        decoding="async"
                    />

                    {Array.isArray(vehicle.photos) && vehicle.photos.length > 1 && (
                        <div className="grid grid-cols-4 gap-3 mt-4">
                            {vehicle.photos.slice(1).map((p: string, idx: number) => (
                                <img
                                    key={idx}
                                    src={toWebP(p)}
                                    className="h-24 w-full object-cover rounded-lg shadow"
                                    loading={getImageLoading(false)}
                                    decoding="async"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* INFO SECTION */}
                <div>
                    <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{vehicle.name}</h1>

                    <p className="text-2xl text-blue-600 font-semibold mb-6">{price}</p>

                    <div className="space-y-3 text-sm">
                        <p><span className="font-semibold">Biển số:</span> {vehicle.licensePlate}</p>

                        {/* 🟩 FIX brand = object */}
                        <p><span className="font-semibold">Hãng xe:</span> {vehicle.brand?.name ?? "—"}</p>

                        <p><span className="font-semibold">Mẫu xe:</span> {vehicle.model ?? "—"}</p>
                        <p><span className="font-semibold">Năm sản xuất:</span> {vehicle.year ?? "—"}</p>
                        <p><span className="font-semibold">Màu sắc:</span> {vehicle.color ?? "—"}</p>

                        <p><span className="font-semibold">Danh mục:</span> {vehicle.category?.name ?? "—"}</p>
                        <p><span className="font-semibold">Chi nhánh:</span> {vehicle.branch?.name ?? "—"}</p>

                        <p>
                            <span className="font-semibold">Tình trạng:</span>{" "}
                            {vehicle.status === "AVAILABLE" && "Sẵn sàng"}
                            {vehicle.status === "MAINTENANCE" && "Bảo dưỡng"}
                            {vehicle.status === "UNAVAILABLE" && "Không khả dụng"}
                        </p>
                    </div>

                    <button
                        className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700"
                        onClick={() => router.push(`/user/bookings/${vehicle.slug}`)}
                    >
                        Thuê ngay
                    </button>
                </div>
            </div>
        </div >
    );
}

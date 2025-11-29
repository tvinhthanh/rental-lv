"use client";

import { useState, useEffect } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import Link from "next/link";

export default function CarSlider() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [index, setIndex] = useState(0);
    const { formatVND } = useFormatVND();

    useEffect(() => {
        vehicleService.getAll().then((data) => {
            const items = Array.isArray(data) ? data : data?.items ?? [];
            const filtered = items.filter(
                (v: any) => v.photos?.length > 0 && (v.priceList || v.overridePriceEnabled)
            );
            setVehicles(filtered);
        });
    }, []);

    const next = () => {
        if (vehicles.length === 0) return;
        setIndex((prev) => (prev + 1) % vehicles.length);
    };

    const prev = () => {
        if (vehicles.length === 0) return;
        setIndex((prev) => (prev - 1 + vehicles.length) % vehicles.length);
    };

    if (vehicles.length === 0) {
        return (
            <div className="py-20 text-center text-gray-400">
                Đang tải xe nổi bật...
            </div>
        );
    }

    const car = vehicles[index];
    const photo = car.photos?.[0];
    const price = car.priceList?.dailyRate
        ? formatVND(car.priceList.dailyRate) + " / ngày"
        : "—";

    const slug = car.slug ?? car.id;

    return (
        <section className="relative overflow-hidden py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
            <div className="max-w-6xl mx-auto relative px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Xe nổi bật</p>
                        <h2 className="text-3xl md:text-4xl font-bold">Dòng xe được yêu thích nhất</h2>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={prev}
                            className="h-12 w-12 rounded-full border border-white/30 text-white hover:border-white transition flex items-center justify-center text-2xl"
                            aria-label="Xe trước"
                        >
                            ‹
                        </button>
                        <button
                            onClick={next}
                            className="h-12 w-12 rounded-full border border-white/30 text-white hover:border-white transition flex items-center justify-center text-2xl"
                            aria-label="Xe kế tiếp"
                        >
                            ›
                        </button>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 items-center bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent rounded-xl" />
                        <img
                            src={photo}
                            className="w-full h-[360px] md:h-[420px] object-cover rounded-xl"
                            alt={car.name}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                            Đời mới • Bảo dưỡng định kỳ
                        </div>
                        <h3 className="text-3xl font-bold">{car.name}</h3>
                        <p className="text-blue-200 text-lg">{price}</p>
                        <p className="text-slate-200">
                            {car.model ?? "Mẫu xe cao cấp"} • {car.transmission ?? "Tự động"} • {car.fuelType ?? "Xăng"}
                        </p>
                        <div className="flex flex-wrap gap-3 pt-3">
                            {car.branch?.name && (
                                <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{car.branch.name}</span>
                            )}
                            {car.category?.name && (
                                <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{car.category.name}</span>
                            )}
                            {car.brand?.name && (
                                <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{car.brand.name}</span>
                            )}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Link
                                href={`/user/cars/${slug}`}
                                className="px-5 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition"
                            >
                                Xem chi tiết
                            </Link>
                            <Link
                                href={`/user/bookings/${slug}`}
                                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
                            >
                                Đặt ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

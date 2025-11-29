"use client";

import { useState, useEffect } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { toWebP, getImageLoading } from "@/lib/image-utils";
import Link from "next/link";

export default function CarSlider() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { formatVND } = useFormatVND();

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const data = await vehicleService.getAll();
                if (cancelled) return;

                const items = Array.isArray(data) ? data : data?.items ?? [];
                const filtered = items.filter((v: any) => Array.isArray(v.photos) && v.photos.length > 0);

                if (filtered.length === 0 && items.length > 0) {
                    console.warn("[CarSlider] No vehicles passed filter! Check vehicle data structure.");
                }

                setVehicles(filtered);
                setError(null);
            } catch (err: any) {
                if (!cancelled) {
                    console.error("[CarSlider] Error fetching vehicles:", err);
                    setError(err?.message || "Không thể tải danh sách xe");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    const next = () => {
        if (vehicles.length <= 1) return;
        if (vehicles.length === 2) {
            setIndex((prev) => (prev + 1) % 2);
        } else {
            setIndex((prev) => {
                const nextIndex = prev + 2;
                return nextIndex >= vehicles.length ? 0 : nextIndex;
            });
        }
    };

    const prev = () => {
        if (vehicles.length <= 1) return;
        if (vehicles.length === 2) {
            setIndex((prev) => (prev + 1) % 2);
        } else {
            setIndex((prev) => {
                const prevIndex = prev - 2;
                return prevIndex < 0 ? vehicles.length - (vehicles.length % 2 === 0 ? 2 : 1) : prevIndex;
            });
        }
    };

    if (loading) {
        return (
            <section className="relative overflow-hidden py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
                <div className="max-w-6xl mx-auto relative px-4 py-20 text-center text-gray-400">
                    Đang tải xe nổi bật...
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="relative overflow-hidden py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
                <div className="max-w-6xl mx-auto relative px-4 py-20 text-center">
                    <p className="text-red-400 mb-2">Lỗi: {error}</p>
                    <p className="text-gray-400 text-sm">Vui lòng thử lại sau</p>
                </div>
            </section>
        );
    }

    if (vehicles.length === 0) {
        return (
            <section className="relative overflow-hidden py-16">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
                <div className="max-w-6xl mx-auto relative px-4 py-20 text-center text-gray-400">
                    Chưa có xe nổi bật để hiển thị
                </div>
            </section>
        );
    }

    const getDisplayCars = () => {
        if (vehicles.length === 0) return [];
        if (vehicles.length === 1) return [{ ...vehicles[0], displayIndex: 0 }];

        const cars = [];
        const firstIndex = index % vehicles.length;
        cars.push({ ...vehicles[firstIndex], displayIndex: 0 });

        let secondIndex = (firstIndex + 1) % vehicles.length;
        if (secondIndex === firstIndex) {
            secondIndex = (firstIndex + 1) % vehicles.length;
        }
        cars.push({ ...vehicles[secondIndex], displayIndex: 1 });
        return cars;
    };

    const displayCars = getDisplayCars();

    return (
        <section className="relative overflow-hidden py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
            <div className="max-w-6xl mx-auto relative px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Xe nổi bật</p>
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                            Dòng xe được yêu thích nhất
                        </h2>
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

                <div className={`grid gap-6 ${displayCars.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1"}`}>
                    {displayCars.map((car, idx) => {
                        const photo = car.photos?.[0];
                        const price = car.priceList?.dailyRate
                            ? `${formatVND(car.priceList.dailyRate)} / ngày`
                            : (car as any).overridePriceEnabled && (car as any).overrideDailyRate
                                ? `${formatVND((car as any).overrideDailyRate)} / ngày`
                                : "Liên hệ";
                        const slug = car.slug ?? car.id;
                        const uniqueKey = `${car.id}-${car.displayIndex ?? idx}`;

                        return (
                            <div key={uniqueKey} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur">
                                <div className="relative mb-4">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent rounded-xl" />
                                    <img
                                        src={toWebP(photo)}
                                        className="w-full h-[280px] md:h-[320px] object-cover rounded-xl"
                                        alt={car.name}
                                        loading={getImageLoading(idx === 0)}
                                        decoding="async"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                        Đời mới • Bảo dưỡng định kỳ
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                                        {car.name}
                                    </h3>
                                    <p className="text-blue-200 text-lg font-semibold">{price}</p>
                                    <p className="text-slate-200 text-sm">
                                        {car.model ?? "Mẫu xe cao cấp"} • {car.transmission ?? "Tự động"} • {car.fuelType ?? "Xăng"}
                                    </p>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {car.branch?.name && (
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs">{car.branch.name}</span>
                                        )}
                                        {car.category?.name && (
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs">{car.category.name}</span>
                                        )}
                                        {car.brand?.name && (
                                            <span className="px-3 py-1 rounded-full bg-white/10 text-xs">{car.brand.name}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-3">
                                        <Link
                                            href={`/user/cars/${slug}`}
                                            className="flex-1 px-4 py-2.5 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition text-center text-sm"
                                        >
                                            Xem chi tiết
                                        </Link>
                                        <Link
                                            href={`/user/bookings/${slug}`}
                                            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow text-center text-sm"
                                        >
                                            Đặt ngay
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

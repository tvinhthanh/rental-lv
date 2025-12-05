"use client";

import { useEffect, useState } from "react";
import { priceListService } from "@/services/price-list.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PricingSection() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { formatVND } = useFormatVND();

    async function load() {
        try {
            setLoading(true);

            const data = await priceListService.getAll();
            const arr = data?.items ?? [];

            setPackages(
                arr.map((p: any) => ({
                    id: p.id,
                    title: p.name ?? "Gói thuê",
                    price: p.dailyRate ? `${formatVND(p.dailyRate)} / ngày` : "—",
                    description: p.description ?? "",
                    raw: p,
                }))
            );
        } catch (err) {
            console.error("Failed to load price lists:", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    const next = () => {
        setCurrentIndex((prev) => (prev + 1) % packages.length);
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
    };

    if (loading) {
        return (
            <div className="text-center text-gray-200 py-10 bg-[#0b1424]">
                Đang tải gói thuê...
            </div>
        );
    }

    if (packages.length === 0) {
        return (
            <section className="py-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1424] via-[#0c1f36] to-[#0b1424]" />
                <div className="max-w-6xl mx-auto relative px-4">
                    <p className="text-center text-blue-100">
                        Hiện chưa có gói thuê nào.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1424] via-[#0c1f36] to-[#0b1424]" />
<<<<<<< HEAD
            <div className="max-w-5xl mx-auto relative px-4 md:px-8">
=======
            <div className="max-w-7xl mx-auto relative px-4 md:px-8">
>>>>>>> b9b3026 (update layout)
                <div className="text-center mb-12">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Bảng giá & ưu đãi</p>
                    <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Chọn gói thuê phù hợp</h2>
                </div>

<<<<<<< HEAD
                <div className="relative h-[500px] md:h-[550px] flex items-center justify-center perspective-1000 w-full">
=======
                {/* VIP Card Stack Container */}
                <div className="relative h-[500px] md:h-[550px] flex items-center justify-center perspective-1000 w-full">
                    {/* Navigation buttons */}
>>>>>>> b9b3026 (update layout)
                    {packages.length > 1 && (
                        <>
                            <button
                                onClick={prev}
                                className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-lg text-white hover:border-white hover:bg-white/20 transition-all flex items-center justify-center shadow-xl"
                                aria-label="Gói trước"
                            >
                                <ChevronLeft className="w-7 h-7" />
                            </button>
                            <button
                                onClick={next}
                                className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-lg text-white hover:border-white hover:bg-white/20 transition-all flex items-center justify-center shadow-xl"
                                aria-label="Gói tiếp theo"
                            >
                                <ChevronRight className="w-7 h-7" />
                            </button>
                        </>
                    )}

<<<<<<< HEAD
                    <div className="relative w-full max-w-2xl mx-auto h-full flex items-center justify-center">
                        {packages.map((pkg, idx) => {
                            let offset = idx - currentIndex;
=======
                    {/* Stacked Cards */}
                    <div className="relative w-full max-w-2xl mx-auto h-full flex items-center justify-center">
                        {packages.map((pkg, idx) => {
                            // Calculate circular offset for smooth infinite loop
                            let offset = idx - currentIndex;
                            
                            // Handle wrap-around for circular motion
>>>>>>> b9b3026 (update layout)
                            if (offset > packages.length / 2) {
                                offset = offset - packages.length;
                            } else if (offset < -packages.length / 2) {
                                offset = offset + packages.length;
                            }
<<<<<<< HEAD

                            const absOffset = Math.abs(offset);
                            const isActive = offset === 0;

                            let transform = "";
                            let scale = 1;
                            let opacity = 1;
                            const zIndex = packages.length - absOffset;

                            if (offset < 0) {
                                transform = `translateX(${-280 + offset * 40}px) translateZ(${-absOffset * 50}px) rotateY(${offset * 15}deg)`;
                                scale = 1 - absOffset * 0.15;
                                opacity = 1 - absOffset * 0.4;
                            } else if (offset > 0) {
                                transform = `translateX(${280 + offset * 40}px) translateZ(${-absOffset * 50}px) rotateY(${offset * 15}deg)`;
                                scale = 1 - absOffset * 0.15;
                                opacity = 1 - absOffset * 0.4;
                            } else {
=======
                            
                            const absOffset = Math.abs(offset);
                            const isActive = offset === 0;

                            // Calculate transform based on position
                            let transform = "";
                            let scale = 1;
                            let opacity = 1;
                            let zIndex = packages.length - absOffset;

                            if (offset < 0) {
                                // Card to the left
                                transform = `translateX(${-180 + offset * 30}px) translateZ(${-absOffset * 50}px) rotateY(${offset * 15}deg)`;
                                scale = 1 - absOffset * 0.15;
                                opacity = 1 - absOffset * 0.4;
                            } else if (offset > 0) {
                                // Card to the right
                                transform = `translateX(${180 + offset * 30}px) translateZ(${-absOffset * 50}px) rotateY(${offset * 15}deg)`;
                                scale = 1 - absOffset * 0.15;
                                opacity = 1 - absOffset * 0.4;
                            } else {
                                // Active card (center)
>>>>>>> b9b3026 (update layout)
                                transform = "translateX(0) translateZ(0) rotateY(0deg)";
                                scale = 1;
                                opacity = 1;
                            }

<<<<<<< HEAD
=======
                            // Clamp values
>>>>>>> b9b3026 (update layout)
                            scale = Math.max(0.7, scale);
                            opacity = Math.max(0.3, opacity);

                            return (
                                <div
                                    key={pkg.id}
                                    className="absolute w-full max-w-lg transition-all duration-500 ease-out cursor-pointer"
                                    style={{
                                        transform: `perspective(1000px) ${transform} scale(${scale})`,
                                        opacity: opacity,
                                        zIndex: zIndex,
                                        transformStyle: "preserve-3d",
                                    }}
                                    onClick={() => setCurrentIndex(idx)}
                                >
<<<<<<< HEAD
                                    <div
                                        className={`border-2 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-lg relative overflow-hidden h-[350px] md:h-[400px] transition-all duration-500 ${
                                            isActive
                                                ? "border-cyan-400/60 bg-gradient-to-br from-white/15 to-white/5 shadow-cyan-500/20"
                                                : "border-white/20 bg-white/5"
                                        }`}
                                    >
=======
                                    <div className={`border-2 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-lg relative overflow-hidden h-[450px] md:h-[500px] transition-all duration-500 ${
                                        isActive
                                            ? "border-cyan-400/60 bg-gradient-to-br from-white/15 to-white/5 shadow-cyan-500/20"
                                            : "border-white/20 bg-white/5"
                                    }`}>
                                        {/* Glow effect for active card */}
>>>>>>> b9b3026 (update layout)
                                        {isActive && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 rounded-3xl pointer-events-none" />
                                        )}

<<<<<<< HEAD
                                        {idx === 0 && (
                                            <span className="absolute top-4 right-4 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-lg z-10">
                                                Khuyến nghị
=======
                                        {/* Badge */}
                                        {idx === 0 && (
                                            <span className="absolute top-4 right-4 text-xs bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1.5 rounded-full font-semibold shadow-lg z-10">
                                                ⭐ Khuyến nghị
>>>>>>> b9b3026 (update layout)
                                            </span>
                                        )}

                                        <div className="relative z-10 h-full flex flex-col">
<<<<<<< HEAD
                                            <h3
                                                className={`text-2xl md:text-3xl font-bold mb-3 transition-all duration-500 ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent"
                                                        : "text-white/70"
                                                }`}
                                            >
=======
                                            <h3 className={`text-2xl md:text-3xl font-bold mb-3 transition-all duration-500 ${
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent"
                                                    : "text-white/70"
                                            }`}>
>>>>>>> b9b3026 (update layout)
                                                {pkg.title}
                                            </h3>

                                            <div className="mb-4">
<<<<<<< HEAD
                                                <p
                                                    className={`text-3xl md:text-4xl font-bold mb-2 transition-all duration-500 ${
                                                        isActive ? "text-cyan-300" : "text-blue-200/70"
                                                    }`}
                                                >
=======
                                                <p className={`text-3xl md:text-4xl font-bold mb-2 transition-all duration-500 ${
                                                    isActive ? "text-cyan-300" : "text-blue-200/70"
                                                }`}>
>>>>>>> b9b3026 (update layout)
                                                    {pkg.price}
                                                </p>
                                            </div>

<<<<<<< HEAD
                                            <p
                                                className={`text-blue-100 mb-6 text-sm md:text-base flex-1 transition-all duration-500 ${
                                                    isActive ? "opacity-100" : "opacity-70"
                                                }`}
                                            >
                                                {pkg.description || "Gói tiêu chuẩn bao gồm bảo hiểm cơ bản và hỗ trợ 24/7."}
                                            </p>

                                            <button
                                                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all duration-500 ${
                                                    isActive
                                                        ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:scale-105 hover:shadow-cyan-500/50"
                                                        : "bg-white/20 text-white/70 hover:bg-white/30"
                                                }`}
                                            >
=======
                                            <p className={`text-blue-100 mb-6 text-sm md:text-base flex-1 transition-all duration-500 ${
                                                isActive ? "opacity-100" : "opacity-70"
                                            }`}>
                                                {pkg.description || "Gói tiêu chuẩn bao gồm bảo hiểm cơ bản và hỗ trợ 24/7."}
                                            </p>

                                            <button className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all duration-500 ${
                                                isActive
                                                    ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white hover:scale-105 hover:shadow-cyan-500/50"
                                                    : "bg-white/20 text-white/70 hover:bg-white/30"
                                            }`}>
>>>>>>> b9b3026 (update layout)
                                                Đặt gói này
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

<<<<<<< HEAD
=======
                {/* Dots indicator - Below cards */}
>>>>>>> b9b3026 (update layout)
                {packages.length > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        {packages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`rounded-full transition-all duration-300 ${
                                    idx === currentIndex
                                        ? "w-10 h-3 bg-gradient-to-r from-indigo-400 to-cyan-400"
                                        : "w-3 h-3 bg-white/40 hover:bg-white/60"
                                }`}
                                aria-label={`Đi tới gói ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </section>
    );
}

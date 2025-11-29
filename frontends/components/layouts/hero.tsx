"use client";

import { useEffect, useState } from "react";
import { toWebP, getImageLoading } from "@/lib/image-utils";

export default function Hero() {
    const heroImages = [
        "/cars/camry.webp",
        "/cars/c300.webp",
        "/cars/luxa.webp",
        "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=1600&q=80",
        "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1600&q=80"
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setCurrent((prev) => (prev + 1) % heroImages.length);
        }, 4000);
        return () => clearInterval(id);
    }, [heroImages.length]);

    return (
        <section className="relative overflow-hidden bg-[#0b1424]">
            <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                {heroImages.map((src, idx) => (
                    <img
                        key={src}
                        src={toWebP(src)}
                        alt={`Xe nổi bật ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${current === idx ? "opacity-100" : "opacity-0"}`}
                        loading={getImageLoading(idx === 0)}
                        decoding="async"
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b1424]/90 via-[#0b1424]/70 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b1424]/50 z-10" />
                
                <div className="absolute inset-0 z-20 flex items-center">
                    <div className="max-w-6xl mx-auto px-4 w-full">
                        <div className="max-w-2xl space-y-5">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-100 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em]">
                                RENTAL LV • CHUẨN HÃNG
                            </div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-lg">
                                Lái xe chuẩn Ford, đặt nhanh trong một chạm
                            </h1>
                            <p className="text-lg md:text-xl text-blue-100 max-w-xl drop-shadow-md">
                                Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7. Chọn xe, đặt lịch và nhận xe tại chi nhánh gần nhất.
                            </p>
                            <div className="flex flex-wrap gap-3 pt-2">
                                <a
                                    href="/user/cars"
                                    className="px-5 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow-lg hover:-translate-y-0.5 transition hover:shadow-xl"
                                >
                                    Xem danh sách xe
                                </a>
                                <a
                                    href="/user/bookings"
                                    className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition"
                                >
                                    Bắt đầu đặt xe
                                </a>
                            </div>
                            <div className="flex flex-wrap gap-6 pt-4 text-sm text-blue-100">
                                <span className="drop-shadow-md">Xe mới 2022-2024</span>
                                <span className="drop-shadow-md">Bảo dưỡng định kỳ</span>
                                <span className="drop-shadow-md">Hỗ trợ 24/7</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-4 right-4 z-30 flex gap-2">
                    {heroImages.map((_, idx) => (
                        <span
                            key={idx}
                            className={`h-2 w-2 rounded-full transition ${current === idx ? "bg-white" : "bg-white/40"}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

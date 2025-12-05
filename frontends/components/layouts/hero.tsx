"use client";

import { useEffect, useState } from "react";

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
        <section className="relative isolate overflow-hidden bg-[#0b1424] min-h-[85vh]">
            <div className="absolute inset-0">
                {heroImages.map((src, idx) => (
                    <img
                        key={src}
                        src={src}
                        alt={`Xe nổi bật ${idx + 1}`}
                        className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-in-out ${current === idx ? "opacity-100 scale-100" : "opacity-0 scale-105"}`}
                    />
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b1424]/80 via-[#0b1424]/70 to-[#0b1424]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.22),transparent_40%),radial-gradient(circle_at_10%_80%,rgba(12,74,110,0.3),transparent_45%)]" />
            </div>

            <div className="relative max-w-4xl mx-auto px-5 pt-20 pb-36 text-center space-y-6">
                <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-4 py-2 rounded-full text-xs uppercase tracking-[0.25em]">
                    Rental LV • Chuẩn hãng
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white drop-shadow-lg">
                    Lái xe chuẩn Ford, đặt nhanh trong một chạm
                </h1>
                <p className="text-lg text-blue-100 max-w-3xl mx-auto">
                    Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7. Chọn xe, đặt lịch và nhận xe tại chi nhánh gần nhất.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <a
                        href="/user/cars"
                        className="px-6 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow-lg hover:-translate-y-0.5 transition"
                    >
                        Xem danh sách xe
                    </a>
                    <a
                        href="/user/bookings"
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg"
                    >
                        Bắt đầu đặt xe
                    </a>
                </div>
                <div className="flex flex-wrap justify-center gap-6 pt-2 text-sm text-blue-100/90">
                    <span>Xe mới 2022-2024</span>
                    <span>Bảo dưỡng định kỳ</span>
                    <span>Hỗ trợ 24/7</span>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroImages.map((_, idx) => (
                    <span
                        key={idx}
                        className={`h-2.5 w-2.5 rounded-full border border-white/50 backdrop-blur ${current === idx ? "bg-white shadow" : "bg-white/40"}`}
                    />
                ))}
            </div>
        </section>
    );
}

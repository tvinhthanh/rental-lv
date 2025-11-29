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
        <section className="relative overflow-hidden bg-[#0b1424]">
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0d2c52] to-[#0b1424]" />
                <div className="absolute -right-10 -top-10 w-[420px] h-[420px] bg-blue-500/20 blur-3xl rounded-full" />
                <div className="absolute -left-20 bottom-0 w-[480px] h-[480px] bg-blue-900/25 blur-3xl rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-3 py-1 rounded-full text-xs uppercase tracking-[0.2em]">
                        Rental LV • Chuẩn hãng
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                        Lái xe chuẩn Ford, đặt nhanh trong một chạm
                    </h1>
                    <p className="text-lg text-blue-100 max-w-xl">
                        Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7. Chọn xe, đặt lịch và nhận xe tại chi nhánh gần nhất.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="/user/cars"
                            className="px-5 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition"
                        >
                            Xem danh sách xe
                        </a>
                        <a
                            href="/auth"
                            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow"
                        >
                            Bắt đầu đặt xe
                        </a>
                    </div>
                    <div className="flex gap-6 pt-4 text-sm text-blue-100">
                        <span>Xe mới 2022-2024</span>
                        <span>Bảo dưỡng định kỳ</span>
                        <span>Hỗ trợ 24/7</span>
                    </div>
                </div>

                <div className="relative h-[320px] md:h-[420px]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent rounded-2xl z-10 pointer-events-none" />
                    {heroImages.map((src, idx) => (
                        <img
                            key={src}
                            src={src}
                            alt={`Xe nổi bật ${idx + 1}`}
                            className={`absolute inset-0 w-full h-full rounded-2xl shadow-2xl border border-white/10 object-cover transition-opacity duration-700 ${current === idx ? "opacity-100" : "opacity-0"}`}
                        />
                    ))}
                    <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                        {heroImages.map((_, idx) => (
                            <span
                                key={idx}
                                className={`h-2 w-2 rounded-full ${current === idx ? "bg-white" : "bg-white/40"}`}
                            />
                        ))}
                    </div>
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

"use client";

import { useEffect, useState } from "react";
import { priceListService } from "@/services/price-list.service";
import { useFormatVND } from "@/hooks/useFormatVND";

export default function PricingSection() {
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { formatVND } = useFormatVND();

    async function load() {
        try {
            setLoading(true);

            const data = await priceListService.getAll();
            // API trả về: { items: [...], total, page, ... }

            const arr = data?.items ?? [];

            setPackages(
                arr.map((p: any) => ({
                    id: p.id,
                    title: p.name ?? "Gói thuê",
                    price: p.dailyRate
                        ? `${formatVND(p.dailyRate)} / ngày`
                        : "—",
                    description: p.description ?? "",
                    raw: p
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

    if (loading) {
        return (
            <div className="text-center text-gray-200 py-10 bg-[#0b1424]">
                Đang tải gói thuê...
            </div>
        );
    }

    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1424] via-[#0c1f36] to-[#0b1424]" />
            <div className="max-w-6xl mx-auto relative px-4">
                <div className="text-center mb-8">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Bảng giá & ưu đãi</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">Chọn gói thuê phù hợp</h2>
                </div>

                {packages.length === 0 ? (
                    <p className="text-center text-blue-100">
                        Hiện chưa có gói thuê nào.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {packages.map((pkg, idx) => (
                            <div
                                key={pkg.id}
                                className="border border-white/10 bg-white/5 rounded-2xl p-6 shadow-2xl backdrop-blur relative overflow-hidden"
                            >
                                {idx === 0 && (
                                    <span className="absolute top-3 right-3 text-xs bg-blue-600 text-white px-3 py-1 rounded-full">
                                        Khuyến nghị
                                    </span>
                                )}
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {pkg.title}
                                </h3>

                                <p className="text-blue-200 text-lg font-bold mb-3">
                                    {pkg.price}
                                </p>

                                <p className="text-blue-100 mb-6 text-sm">
                                    {pkg.description || "Gói tiêu chuẩn bao gồm bảo hiểm cơ bản và hỗ trợ 24/7."}
                                </p>

                                <button className="w-full py-2.5 bg-white text-[#0b1f3a] hover:-translate-y-0.5 transition font-semibold rounded-lg shadow">
                                    Đặt gói này
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

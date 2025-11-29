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
            <div className="text-center text-gray-400 py-10">
                Đang tải gói thuê...
            </div>
        );
    }

    return (
        <section className="py-12 bg-gray-900 text-gray-200">
            <h2 className="text-3xl font-bold text-center mb-8">
                Bảng giá thuê xe
            </h2>

            {packages.length === 0 ? (
                <p className="text-center text-gray-400">
                    Hiện chưa có gói thuê nào.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                    {packages.map((pkg) => (
                        <div
                            key={pkg.id}
                            className="border border-slate-700 bg-slate-800 p-6 rounded-lg shadow hover:shadow-xl transition"
                        >
                            <h3 className="text-xl font-semibold mb-2">
                                {pkg.title}
                            </h3>

                            <p className="text-blue-400 text-lg font-bold mb-3">
                                {pkg.price}
                            </p>

                            <p className="text-gray-400 mb-4">
                                {pkg.description || "Không có mô tả."}
                            </p>

                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white">
                                Chọn gói này
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

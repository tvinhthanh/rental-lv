"use client";

import { useEffect, useState } from "react";
import { priceListService } from "@/services/price-list.service";
import { useFormatVND } from "@/hooks/useFormatVND";

export default function PricingSection() {
    const [packages, setPackages] = useState<any[]>([]);
    const { formatVND } = useFormatVND();

    useEffect(() => {
        async function load() {
            try {
                const data = await priceListService.getAll();

                setPackages(
                    (data || []).map((p: any) => ({
                        id: p.id,
                        title: p.name ?? "Gói thuê",
                        price: p.dailyRate ? `${formatVND(p.dailyRate)} / ngày` : "—",
                        features: [
                            p.description || "Gói tiêu chuẩn",
                            `Giá theo giờ: ${p.hourlyRate ? formatVND(p.hourlyRate) : "—"}`,
                            `Giá cuối tuần: ${p.weekendRate ? formatVND(p.weekendRate) : "—"}`,
                        ],
                    }))
                );
            } catch (err) {
                console.error("Failed to load pricing:", err);
            }
        }

        load();
    }, []);

    return (
        <section className="py-20 bg-white dark:bg-black">
            <h2 className="text-3xl font-bold text-center mb-10">Thẻ thành viên</h2>

            <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
                {packages.length === 0 && (
                    <p className="text-center text-gray-400 col-span-3">
                        Không có bảng giá nào
                    </p>
                )}

                {packages.map((p) => (
                    <div
                        key={p.id}
                        className="p-6 rounded-xl shadow bg-gray-100 dark:bg-zinc-900 hover:shadow-xl transition"
                    >
                        <h3 className="text-2xl font-bold">{p.title}</h3>
                        <p className="text-blue-600 text-xl font-semibold mt-2">{p.price}</p>

                        <ul className="mt-4 space-y-2">
                            {p.features.map((f: string, idx: number) => (
                                <li key={idx} className="text-gray-700 dark:text-gray-300">
                                    • {f}
                                </li>
                            ))}
                        </ul>

                        <button className="mt-6 w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                            Thuê ngay
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}

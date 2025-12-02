"use client";

import { useEffect, useState } from "react";
import { promotionService } from "@/services/promotion.service";
import { Tag, TicketPercent, CalendarRange, Sparkles } from "lucide-react";

export default function UserPromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<any | null>(null);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await promotionService.list();
                const items = Array.isArray(res) ? res : res?.items || [];
                setPromotions(items);
            } catch (err: any) {
                setError(err?.message || "Không thể tải khuyến mãi");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-6xl mx-auto px-4 py-14 space-y-10">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Khuyến mãi</p>
                    <h1 className="text-4xl font-bold">Ưu đãi dành cho bạn</h1>
                    <p className="text-blue-100">Áp dụng mã ưu đãi khi đặt xe để tiết kiệm chi phí.</p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-blue-100">Đang tải khuyến mãi...</div>
                ) : promotions.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-blue-100">
                        Chưa có khuyến mãi nào. Quay lại sau nhé!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {promotions.map((promo) => (
                            <div
                                key={promo.id}
                                className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1f36] via-[#0b1424] to-[#0b1f3a] p-5 shadow-2xl hover:-translate-y-0.5 transition cursor-pointer"
                                onClick={() => setSelected(promo)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2">
                                        <div className="inline-flex items-center gap-2 bg-white/10 text-blue-100 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                            <TicketPercent className="w-4 h-4" />
                                            {promo.code || "PROMO"}
                                        </div>
                                        <h3 className="text-2xl font-bold">{promo.name || "Khuyến mãi"}</h3>
                                        <p className="text-blue-100 text-sm line-clamp-2">{promo.description || "Ưu đãi đặc biệt"}</p>
                                    </div>
                                    <div className="text-right">
                                        {promo.discountPercent && (
                                            <p className="text-2xl font-bold text-emerald-300">-{promo.discountPercent}%</p>
                                        )}
                                        {promo.discountAmount && (
                                            <p className="text-2xl font-bold text-emerald-300">-{promo.discountAmount.toLocaleString("vi-VN")} đ</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-4 text-sm text-blue-100">
                                    <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                        <CalendarRange className="w-4 h-4" />
                                        {promo.startDate ? new Date(promo.startDate).toLocaleDateString("vi-VN") : "Bắt đầu"}
                                        {" - "}
                                        {promo.endDate ? new Date(promo.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                                    </span>
                                    {promo.usageLimit && (
                                        <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                            <Sparkles className="w-4 h-4" />
                                            Giới hạn {promo.usageLimit}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center px-4" onClick={() => setSelected(null)}>
                    <div
                        className="max-w-3xl w-full bg-[#0c1f36] border border-white/10 rounded-2xl p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Mã ưu đãi</p>
                                <h2 className="text-3xl font-bold">{selected.code || "PROMO"}</h2>
                                <p className="text-blue-100">{selected.name}</p>
                            </div>
                            <button
                                onClick={() => navigator.clipboard.writeText(selected.code || "")}
                                className="px-4 py-2 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                            >
                                Sao chép mã
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-100 text-sm">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-2 text-white font-semibold">
                                    <Tag className="w-4 h-4" /> Thông tin
                                </div>
                                <p>{selected.description || "Ưu đãi đặc biệt cho đơn đặt xe"}</p>
                            </div>
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-white font-semibold">
                                    <CalendarRange className="w-4 h-4" /> Thời gian
                                </div>
                                <p>Bắt đầu: {selected.startDate ? new Date(selected.startDate).toLocaleDateString("vi-VN") : "—"}</p>
                                <p>Kết thúc: {selected.endDate ? new Date(selected.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}</p>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelected(null)}
                                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/15"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

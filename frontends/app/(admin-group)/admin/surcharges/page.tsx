"use client";

import { useEffect, useState, Suspense } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import SurchargeCard from "./_components/SurchargeCard";
import SurchargeModal from "./_components/SurchargeModal";

function SurchargesContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [surcharges, setSurcharges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedSurcharge, setSelectedSurcharge] = useState<any | null>(null);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadSurcharges() {
            try {
                setLoading(true);
                const res = await billingService.allSurcharges();
                
                // Lọc chỉ lấy các surcharge có invoice và booking
                const items = Array.isArray(res) ? res.filter((s: any) => s.invoice && s.invoice.booking) : [];
                
                setSurcharges(items);
            } catch (e) {
                console.error("Load surcharges failed", e);
                setError("Không thể tải danh sách phụ phí");
            } finally {
                setLoading(false);
            }
        }

        loadSurcharges();
    }, [user, userLoading]);

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Bàn Phụ Phí
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Hiển thị các hóa đơn có phụ phí, dạng thẻ game.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng phụ phí</p>
                        <p className="text-lg font-semibold text-yellow-400">
                            {surcharges.length.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : surcharges.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Hiện chưa có phụ phí nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {surcharges.map((s) => (
                            <SurchargeCard
                                key={s.id}
                                surcharge={s}
                                onClick={() => {
                                    setSelectedSurcharge(s);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Surcharge Detail Modal */}
            {selectedSurcharge && (
                <SurchargeModal
                    surcharge={selectedSurcharge}
                    onClose={() => setSelectedSurcharge(null)}
                />
            )}
        </div>
    );
}

export default function SurchargesPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <SurchargesContent />
        </Suspense>
    );
}

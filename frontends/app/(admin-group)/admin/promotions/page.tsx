"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { promotionService } from "@/services/promotion.service";
import { Tag } from "lucide-react";

export default function AdminPromotionsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadPromotions() {
            try {
                setLoading(true);
                const res = await promotionService.list();
                const items = Array.isArray(res) ? res : (res?.items || []);
                setPromotions(items);
                setTotal(items.length);
            } catch (err) {
                console.error("Load promotions failed:", err);
                setError("Không thể tải danh sách khuyến mãi");
            } finally {
                setLoading(false);
            }
        }

        loadPromotions();
    }, [user, userLoading]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Khuyến Mãi
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả chương trình khuyến mãi trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng khuyến mãi</p>
                        <p className="text-lg font-semibold text-purple-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {promotions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <Tag className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có khuyến mãi nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {promotions.map((promotion) => (
                            <div
                                key={promotion.id}
                                onClick={() => {
                                    setSelectedPromotion(promotion);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm font-semibold text-purple-400">
                                            {promotion.code || promotion.name || "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300 font-medium">
                                        {promotion.name || "—"}
                                    </p>
                                    <p className="text-gray-400 text-xs line-clamp-2">
                                        {promotion.description || "—"}
                                    </p>
                                    {promotion.discountPercent && (
                                        <p className="text-lg font-bold text-purple-400">
                                            Giảm {promotion.discountPercent}%
                                        </p>
                                    )}
                                    {promotion.discountAmount && (
                                        <p className="text-lg font-bold text-purple-400">
                                            Giảm {promotion.discountAmount.toLocaleString("vi-VN")} đ
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openModal && selectedPromotion && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Chi Tiết Khuyến Mãi</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Mã: {selectedPromotion.code || selectedPromotion.name || "—"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Tên</p>
                                    <p className="text-white text-lg font-semibold">{selectedPromotion.name || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Mô tả</p>
                                    <p className="text-white">{selectedPromotion.description || "—"}</p>
                                </div>

                                {selectedPromotion.discountPercent && (
                                    <div>
                                        <p className="text-slate-400">Giảm giá</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            {selectedPromotion.discountPercent}%
                                        </p>
                                    </div>
                                )}

                                {selectedPromotion.discountAmount && (
                                    <div>
                                        <p className="text-slate-400">Giảm giá</p>
                                        <p className="text-2xl font-bold text-purple-400">
                                            {selectedPromotion.discountAmount.toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                )}

                                {selectedPromotion.startDate && (
                                    <div>
                                        <p className="text-slate-400">Ngày bắt đầu</p>
                                        <p className="text-white">
                                            {new Date(selectedPromotion.startDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedPromotion.endDate && (
                                    <div>
                                        <p className="text-slate-400">Ngày kết thúc</p>
                                        <p className="text-white">
                                            {new Date(selectedPromotion.endDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedPromotion.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedPromotion.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

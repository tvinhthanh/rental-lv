"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { promotionService } from "@/services/promotion.service";
import { Tag } from "lucide-react";
import PromotionModal from "./_components/promotion-modal";
import { toast } from "sonner";

export default function AdminPromotionsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [editingPromotion, setEditingPromotion] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);

    const loadPromotions = async () => {
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
    };

    const handleDelete = async (promotion: any) => {
        if (!confirm("Xóa khuyến mãi này?")) return;
        try {
            await promotionService.delete(promotion.id);
            toast.success("Đã xóa khuyến mãi");
            loadPromotions();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa khuyến mãi thất bại");
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") return;
        Promise.resolve().then(() => loadPromotions());
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
                    <button
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:-translate-y-0.5 transition"
                        onClick={() => {
                            setEditingPromotion(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm khuyến mãi
                    </button>
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
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 flex flex-col gap-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-5 h-5 text-purple-400" />
                                        <span className="text-sm font-semibold text-purple-400">
                                            {promotion.code || promotion.name || "—"}
                                        </span>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200">
                                        {promotion.status === 'ACTIVE' ? 'Hoạt động' : promotion.status === 'INACTIVE' ? 'Ngừng hoạt động' : promotion.status || "Hoạt động"}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm flex-1">
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
                                    <div className="text-xs text-slate-400 flex flex-wrap gap-2">
                                        {promotion.startDate && (
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                                Bắt đầu: {new Date(promotion.startDate).toLocaleDateString("vi-VN")}
                                            </span>
                                        )}
                                        {promotion.endDate && (
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                                Hết hạn: {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                                            </span>
                                        )}
                                        {promotion.usageLimit && (
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
                                                Đã dùng: {promotion.usedCount ?? 0}/{promotion.usageLimit}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        onClick={() => {
                                            setEditingPromotion(promotion);
                                            setOpenForm(true);
                                        }}
                                        className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-white"
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        onClick={() => handleDelete(promotion)}
                                        className="px-3 py-2 rounded bg-rose-600/80 hover:bg-rose-600 text-white"
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openForm && (
                    <PromotionModal
                        open={openForm}
                        selected={editingPromotion}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingPromotion(null);
                        }}
                        onSaved={() => {
                            setOpenForm(false);
                            setEditingPromotion(null);
                            loadPromotions();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

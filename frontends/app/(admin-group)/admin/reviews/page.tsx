"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { reviewService } from "@/services/review.service";
import { Star } from "lucide-react";

export default function AdminReviewsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedReview, setSelectedReview] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") return;

        async function loadReviews() {
            try {
                setLoading(true);
                const res = await reviewService.list();
                const items = Array.isArray(res) ? res : (res?.items || []);
                setReviews(items);
                setTotal(items.length);
            } catch (err) {
                console.error("Load reviews failed:", err);
                setError("Không thể tải danh sách đánh giá");
            } finally {
                setLoading(false);
            }
        }

        Promise.resolve().then(() => loadReviews());
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
                            Danh Sách Đánh Giá
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả đánh giá khách hàng trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng đánh giá</p>
                        <p className="text-lg font-semibold text-yellow-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <Star className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có đánh giá nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                onClick={() => {
                                    setSelectedReview(review);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                        <span className="text-sm font-semibold text-yellow-400">
                                            {review.rating || 0}/5
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300 font-medium">
                                        {review.customer?.fullName || review.customerName || "Khách hàng"}
                                    </p>
                                    <p className="text-gray-400 text-xs line-clamp-2">
                                        {review.comment || review.content || "—"}
                                    </p>
                                    <p className="text-gray-500 text-xs">
                                        {review.vehicle?.name || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openModal && selectedReview && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Chi Tiết Đánh Giá</h2>
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
                                    <p className="text-slate-400">Khách hàng</p>
                                    <p className="text-white text-lg font-semibold">
                                        {selectedReview.customer?.fullName || selectedReview.customerName || "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Đánh giá</p>
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-5 h-5 ${
                                                    i < (selectedReview.rating || 0)
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-slate-600"
                                                }`}
                                            />
                                        ))}
                                        <span className="ml-2 text-white">({selectedReview.rating || 0}/5)</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-slate-400">Nội dung</p>
                                    <p className="text-white">{selectedReview.comment || selectedReview.content || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Xe</p>
                                    <p className="text-white">{selectedReview.vehicle?.name || "—"}</p>
                                </div>

                                {selectedReview.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày đánh giá</p>
                                        <p className="text-white">
                                            {new Date(selectedReview.createdAt).toLocaleDateString("vi-VN")}
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

"use client";

import { useEffect, useState } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { reviewService } from "@/services/review.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { toWebP, getImageLoading } from "@/lib/image-utils";
import { notFound, useParams, useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function CarDetailPage() {
    const { slug } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const { formatVND } = useFormatVND();
    const router = useRouter();

    useEffect(() => {
        if (!slug) return;

        vehicleService.getBySlug(slug as string).then((res) => {
            if (!res) return notFound();

            // 🟦 Normalize mọi dạng response
            let data = res;

            if (res?.items && Array.isArray(res.items)) {
                data = res.items[0] || null;
            }

            if (res?.data) {
                data = res.data;
            }

            if (!data) return notFound();

            setVehicle(data);
            // load reviews for this vehicle
            setReviewLoading(true);
            reviewService
                .list({ vehicleId: data.id, limit: 20 })
                .then((revRes) => {
                    const items = Array.isArray(revRes?.items) ? revRes.items : Array.isArray(revRes) ? revRes : [];
                    setReviews(items);
                })
                .catch((err) => {
                    console.error("Load reviews failed:", err);
                    setReviewError(err?.message || "Không thể tải đánh giá");
                })
                .finally(() => setReviewLoading(false));
        });
    }, [slug]);

    if (!vehicle) {
        return (
            <div className="p-10 text-center text-gray-400">
                Đang tải thông tin xe...
            </div>
        );
    }

    const price = vehicle?.priceList?.dailyRate
        ? formatVND(vehicle.priceList.dailyRate) + " / ngày"
        : "—";

    const avgRating = vehicle?.rating || (reviews.length ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length : 0);

    return (
        <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-200">
            <div className="grid md:grid-cols-2 gap-10">

                {/* IMAGE SECTION */}
                <div>
                    <img
                        src={toWebP(vehicle.photos?.[0])}
                        alt={vehicle.name}
                        className="w-full h-[420px] object-cover rounded-xl shadow"
                        loading={getImageLoading(true)}
                        decoding="async"
                    />

                    {Array.isArray(vehicle.photos) && vehicle.photos.length > 1 && (
                        <div className="grid grid-cols-4 gap-3 mt-4">
                            {vehicle.photos.slice(1).map((p: string, idx: number) => (
                                <img
                                    key={idx}
                                    src={toWebP(p)}
                                    className="h-24 w-full object-cover rounded-lg shadow"
                                    loading={getImageLoading(false)}
                                    decoding="async"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* INFO SECTION */}
                <div>
                    <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{vehicle.name}</h1>

                    <p className="text-2xl text-blue-600 font-semibold mb-6">{price}</p>

                    <div className="space-y-3 text-sm">
                        <p><span className="font-semibold">Biển số:</span> {vehicle.licensePlate}</p>

                        {/* 🟩 FIX brand = object */}
                        <p><span className="font-semibold">Hãng xe:</span> {vehicle.brand?.name ?? "—"}</p>

                        <p><span className="font-semibold">Mẫu xe:</span> {vehicle.model ?? "—"}</p>
                        <p><span className="font-semibold">Năm sản xuất:</span> {vehicle.year ?? "—"}</p>
                        <p><span className="font-semibold">Màu sắc:</span> {vehicle.color ?? "—"}</p>

                        <p><span className="font-semibold">Danh mục:</span> {vehicle.category?.name ?? "—"}</p>
                        <p><span className="font-semibold">Chi nhánh:</span> {vehicle.branch?.name ?? "—"}</p>

                        <p>
                            <span className="font-semibold">Tình trạng:</span>{" "}
                            {vehicle.status === "AVAILABLE" && "Sẵn sàng"}
                            {vehicle.status === "MAINTENANCE" && "Bảo dưỡng"}
                            {vehicle.status === "UNAVAILABLE" && "Không khả dụng"}
                        </p>
                    </div>

                    <button
                        className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700"
                        onClick={() => router.push(`/user/bookings/${vehicle.slug}`)}
                    >
                        Thuê ngay
                    </button>
                </div>
            </div>

            <div className="mt-10 rounded-2xl bg-gray-900/60 border border-white/10 p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Đánh giá sau hoàn tất booking</p>
                        <h2 className="text-2xl font-bold text-white">Trải nghiệm từ khách thuê</h2>
                        <p className="text-sm text-blue-100">
                            Chỉ hiển thị các đánh giá từ đơn đã hoàn thành/đã trả xe, giúp bạn tham khảo nhanh.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white">
                        <div className="flex items-center gap-1 text-yellow-400">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-yellow-400" : "text-gray-500"}`}
                                />
                            ))}
                        </div>
                        <div className="text-sm leading-tight text-right">
                            <div className="font-semibold">{avgRating.toFixed(1)}/5</div>
                            <div className="text-blue-100 text-xs">
                                {vehicle?.reviewCount || reviews.length || 0} lượt đánh giá
                            </div>
                        </div>
                    </div>
                </div>

                {reviewLoading ? (
                    <div className="text-blue-100">Đang tải đánh giá...</div>
                ) : reviewError ? (
                    <div className="text-rose-300">{reviewError}</div>
                ) : reviews.length === 0 ? (
                    <div className="text-blue-100">Chưa có đánh giá nào cho xe này.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reviews.map((rev) => (
                            <div key={rev.id} className="p-4 rounded-xl border border-white/10 bg-white/5 shadow">
                                <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < rev.rating ? "fill-yellow-400" : "text-gray-500"}`}
                                        />
                                    ))}
                                    <span className="text-sm text-blue-100">{rev.rating}/5</span>
                                </div>
                                <p className="text-white font-semibold mb-1">
                                    {rev.customer?.fullName || "Khách thuê"}
                                </p>
                                <p className="text-blue-100 text-sm mb-3">{rev.comment || "Không có nhận xét"}</p>
                                <div className="text-xs text-blue-200 flex flex-wrap gap-2">
                                    {rev.booking?.bookingCode && (
                                        <span className="px-2 py-1 bg-white/10 rounded-full">
                                            Mã booking: {rev.booking.bookingCode}
                                        </span>
                                    )}
                                    <span className="px-2 py-1 bg-white/10 rounded-full">
                                        Ngày: {new Date(rev.createdAt || Date.now()).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
}

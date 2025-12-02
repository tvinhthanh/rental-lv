"use client";

import { useEffect, useMemo, useState } from "react";
import { useCustomer } from "@/hooks/useCustomer";
import { bookingService } from "@/services/booking.service";
import { reviewService } from "@/services/review.service";
import { Star, Car, CalendarDays, CheckCircle2 } from "lucide-react";

export default function UserReviewsPage() {
    const { customer, loading: customerLoading } = useCustomer();
    const [reviews, setReviews] = useState<any[]>([]);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        bookingId: "",
        rating: 5,
        comment: ""
    });
    const [submitting, setSubmitting] = useState(false);

    const eligibleBookings = useMemo(() => {
        const eligibleStatus = ["COMPLETED", "RETURNED", "CONTRACTED"];
        return bookings.filter((b) => eligibleStatus.includes(b.status) && !b.review);
    }, [bookings]);

    useEffect(() => {
        if (customerLoading) return;
        if (!customer) {
            setLoading(false);
            return;
        }
        async function load() {
            try {
                setLoading(true);
                const [revRes, bookingRes] = await Promise.all([
                    reviewService.list({ customerId: customer.id }),
                    bookingService.list({ customerId: customer.id, limit: 100 })
                ]);
                const revItems = Array.isArray(revRes?.items) ? revRes.items : Array.isArray(revRes) ? revRes : [];
                const bookingItems = bookingRes?.items ?? [];
                setReviews(revItems);
                setBookings(bookingItems);
            } catch (err: any) {
                setError(err?.message || "Không thể tải đánh giá");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [customer, customerLoading]);

    const submit = async () => {
        if (!customer || !form.bookingId) return;
        try {
            setSubmitting(true);
            const booking = bookings.find((b) => b.id === form.bookingId);
            if (!booking) throw new Error("Không tìm thấy booking");
            await reviewService.create({
                bookingId: booking.id,
                customerId: customer.id,
                vehicleId: booking.vehicleId,
                rating: Number(form.rating),
                comment: form.comment || undefined
            });
            setForm({ bookingId: "", rating: 5, comment: "" });
            // reload
            const revRes = await reviewService.list({ customerId: customer.id });
            const revItems = Array.isArray(revRes?.items) ? revRes.items : Array.isArray(revRes) ? revRes : [];
            setReviews(revItems);
            // mark booking reviewed
            setBookings((prev) =>
                prev.map((b) => (b.id === booking.id ? { ...b, review: { id: "new" } } : b))
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Gửi đánh giá thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    if (customerLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center">
                <div className="loader" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center px-4">
                <div className="max-w-lg text-center space-y-3">
                    <h1 className="text-2xl font-semibold text-white">Bạn cần hồ sơ khách hàng</h1>
                    <p className="text-blue-100">Vui lòng cập nhật hồ sơ để gửi đánh giá.</p>
                    <a
                        href="/user/profile"
                        className="inline-block px-5 py-3 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                    >
                        Đi tới hồ sơ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-6xl mx-auto px-4 py-14 space-y-10">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Đánh giá</p>
                    <h1 className="text-4xl font-bold">Chia sẻ trải nghiệm thuê xe</h1>
                    <p className="text-blue-100">Hãy để lại đánh giá sau khi hoàn tất chuyến đi.</p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error}
                    </div>
                )}

                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl">
                        <p className="text-sm uppercase tracking-[0.15em] text-blue-200">Gửi đánh giá</p>
                        <div className="space-y-3 mt-3">
                            <label className="space-y-1 text-sm text-blue-100">
                                <span className="block text-xs uppercase tracking-[0.12em] text-blue-200">Booking</span>
                                <select
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white focus:outline-none focus:border-white/40"
                                    value={form.bookingId}
                                    onChange={(e) => setForm({ ...form, bookingId: e.target.value })}
                                >
                                    <option value="">Chọn booking</option>
                                    {eligibleBookings.map((b) => (
                                        <option key={b.id} value={b.id} className="bg-[#0b1424] text-white">
                                            {b.bookingCode} - {b.vehicle?.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-1 text-sm text-blue-100">
                                <span className="block text-xs uppercase tracking-[0.12em] text-blue-200">Đánh giá</span>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((r) => (
                                        <Star
                                            key={r}
                                            className={`w-7 h-7 cursor-pointer ${r <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-blue-200"}`}
                                            onClick={() => setForm({ ...form, rating: r })}
                                        />
                                    ))}
                                </div>
                            </label>
                            <label className="space-y-1 text-sm text-blue-100">
                                <span className="block text-xs uppercase tracking-[0.12em] text-blue-200">Nhận xét</span>
                                <textarea
                                    rows={3}
                                    className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40"
                                    placeholder="Chia sẻ trải nghiệm của bạn..."
                                    value={form.comment}
                                    onChange={(e) => setForm({ ...form, comment: e.target.value })}
                                />
                            </label>
                            <button
                                onClick={submit}
                                disabled={submitting || !form.bookingId}
                                className="w-full py-3 rounded-lg bg-white text-[#0b1f3a] font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                            >
                                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm uppercase tracking-[0.12em] text-blue-200">Đánh giá của bạn</p>
                            <span className="text-blue-100 text-sm flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                {reviews.length} đánh giá
                            </span>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-blue-100">
                                Bạn chưa có đánh giá nào. Hãy hoàn tất chuyến đi và chia sẻ cảm nhận!
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {reviews.map((rev) => (
                                    <div key={rev.id} className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1f36] via-[#0b1424] to-[#0b1f3a] p-5 shadow-2xl">
                                        <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-5 h-5 ${i < rev.rating ? "fill-yellow-400" : "text-blue-200"}`} />
                                            ))}
                                        </div>
                                        <p className="text-white font-semibold mb-2">{rev.vehicle?.name || "Xe"}</p>
                                        <p className="text-blue-100 text-sm mb-3">{rev.comment || "Không có nhận xét"}</p>
                                        <div className="flex flex-wrap gap-2 text-blue-100 text-xs">
                                            <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                                <Car className="w-4 h-4" /> {rev.vehicle?.licensePlate || "—"}
                                            </span>
                                            {rev.booking?.bookingCode && (
                                                <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                                    <CalendarDays className="w-4 h-4" /> {rev.booking.bookingCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

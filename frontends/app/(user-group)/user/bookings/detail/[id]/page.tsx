"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { ArrowLeft, CalendarDays, Car, MapPin, Receipt, User } from "lucide-react";

export default function BookingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { formatVND } = useFormatVND();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [booking, setBooking] = useState<any>(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await bookingService.get(id);
                const data = (res as any)?.data || res;
                setBooking(data || null);
            } catch (err: any) {
                setError(err?.message || "Không thể tải chi tiết booking");
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-white">
                <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-blue-200 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error || "Không tìm thấy booking"}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-blue-200 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại
                    </button>
                    <span className="text-xs px-3 py-1 rounded-full bg-white/10 border border-white/10">
                        {booking.status || "—"}
                    </span>
                </div>

                <header className="space-y-2">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Booking Detail</p>
                    <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                        {booking.bookingCode || `#${String(booking.id || "").slice(0, 8)}`}
                    </h1>
                </header>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-3">
                            <Car className="w-5 h-5 text-cyan-300 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-200">Xe</p>
                                <p className="font-semibold">{booking.vehicle?.name || booking.vehicleId || "—"}</p>
                                {booking.vehicle?.licensePlate && (
                                    <p className="text-sm text-blue-100">Biển số: {booking.vehicle.licensePlate}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <User className="w-5 h-5 text-indigo-300 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-200">Khách hàng</p>
                                <p className="font-semibold">
                                    {booking.customer?.fullName || booking.customer?.name || booking.customerId || "—"}
                                </p>
                                {booking.customer?.phone && (
                                    <p className="text-sm text-blue-100">SĐT: {booking.customer.phone}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <CalendarDays className="w-5 h-5 text-emerald-300 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-200">Thời gian</p>
                                <p className="text-sm text-blue-100">
                                    Nhận:{" "}
                                    <span className="text-white">
                                        {booking.pickupDate ? new Date(booking.pickupDate).toLocaleString("vi-VN") : "—"}
                                    </span>
                                </p>
                                <p className="text-sm text-blue-100">
                                    Trả:{" "}
                                    <span className="text-white">
                                        {booking.returnDate ? new Date(booking.returnDate).toLocaleString("vi-VN") : "—"}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <MapPin className="w-5 h-5 text-orange-300 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-200">Chi nhánh</p>
                                <p className="text-sm text-blue-100">
                                    Nhận: <span className="text-white">{booking.branch?.name || booking.branchId || "—"}</span>
                                </p>
                                <p className="text-sm text-blue-100">
                                    Trả:{" "}
                                    <span className="text-white">
                                        {booking.returnBranch?.name || booking.returnBranchId || booking.branch?.name || booking.branchId || "—"}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex gap-3">
                            <Receipt className="w-5 h-5 text-blue-300 mt-0.5" />
                            <div>
                                <p className="text-xs text-blue-200">Tổng tiền</p>
                                <p className="font-semibold text-blue-100">
                                    {formatVND(booking.totalAmount || 0)}
                                </p>
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200">Tiền gốc</p>
                            <p className="text-sm text-blue-100">{formatVND(booking.baseAmount || 0)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200">Giảm giá</p>
                            <p className="text-sm text-blue-100">{formatVND(booking.discountAmount || 0)}</p>
                        </div>
                    </div>

                    {booking.note && (
                        <div className="pt-4 border-t border-white/10">
                            <p className="text-xs text-blue-200 mb-1">Ghi chú</p>
                            <p className="text-sm text-blue-100 whitespace-pre-wrap">{booking.note}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


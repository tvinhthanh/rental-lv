"use client";

import { useEffect, useMemo, useState } from "react";
import { bookingService } from "@/services/booking.service";
import { useCustomer } from "@/hooks/useCustomer";
import Link from "next/link";
import { CalendarDays, Car, MapPin, Receipt, Timer } from "lucide-react";

export default function UserBookingsPage() {
    const { customer, loading: customerLoading } = useCustomer();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerLoading) return;
        if (!customer) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                const res = await bookingService.list({
                    customerId: customer.id,
                    limit: 50,
                    page: 1
                });
                const items = Array.isArray(res?.items) ? res.items : [];
                setBookings(items);
            } catch (err: any) {
                setError(err?.message || "Không thể tải danh sách đặt xe");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [customer, customerLoading]);

    const statusColor = useMemo(
        () => ({
            PENDING: "bg-yellow-500/20 text-yellow-200",
            CONFIRMED: "bg-blue-500/20 text-blue-200",
            ONGOING: "bg-emerald-500/20 text-emerald-200",
            CONTRACTED: "bg-indigo-500/20 text-indigo-200",
            COMPLETED: "bg-emerald-500/30 text-emerald-100",
            CANCELLED: "bg-rose-500/20 text-rose-200"
        }),
        []
    );

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
                    <p className="text-blue-100">Vui lòng cập nhật hồ sơ để xem và quản lý các lượt đặt xe.</p>
                    <a
                        href="/user/profile"
                        className="inline-block px-5 py-3 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                    >
                        Cập nhật hồ sơ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-6xl mx-auto px-4 py-14 space-y-10">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Booking & hậu kiểm</p>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Lịch sử đặt xe của bạn</h1>
                    <p className="text-blue-100">Theo dõi trạng thái đặt xe, hợp đồng, bàn giao và hoàn trả.</p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-blue-100">
                        Chưa có lượt đặt xe nào. Khám phá xe và đặt ngay!
                        <div className="mt-4">
                            <a
                                href="/user/cars"
                                className="inline-block px-5 py-3 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition"
                            >
                                Xem xe
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bookings.map((b) => (
                            <div
                                key={b.id}
                                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1f36] via-[#0b1424] to-[#0b1f3a] p-6 shadow-2xl"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                                            <Car className="w-4 h-4" />
                                            <span className="font-semibold">{b.vehicle?.name ?? "Xe"}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold">{b.bookingCode}</h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-blue-100">
                                            <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                                <CalendarDays className="w-4 h-4" />
                                                {new Date(b.pickupDate).toLocaleDateString("vi-VN")} →{" "}
                                                {new Date(b.returnDate).toLocaleDateString("vi-VN")}
                                            </span>
                                            <span className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full">
                                                <MapPin className="w-4 h-4" />
                                                {b.branch?.name ?? "Chi nhánh"}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            // @ts-ignore
                                            statusColor[b.status] || "bg-white/10 text-white"
                                        }`}
                                    >
                                        {b.status}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-blue-100">
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                        <p className="text-xs uppercase tracking-[0.12em] text-blue-200 flex items-center gap-2">
                                            <Receipt className="w-4 h-4" /> Hóa đơn
                                        </p>
                                        <p className="font-semibold">
                                            {b.invoice?.invoiceNo ?? "Chưa tạo"}{" "}
                                            {b.invoice?.status && (
                                                <span className="text-xs ml-1 text-emerald-200">{b.invoice.status}</span>
                                            )}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                                        <p className="text-xs uppercase tracking-[0.12em] text-blue-200 flex items-center gap-2">
                                            <Timer className="w-4 h-4" /> Hậu kiểm
                                        </p>
                                        <p className="font-semibold">
                                            {b.returnReport ? "Đã trả xe" : b.handover ? "Đang thuê" : "Chờ bàn giao"}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 flex justify-between items-center">
                                    <div className="text-sm text-blue-200">
                                        Tổng:{" "}
                                        <span className="text-white font-semibold">
                                            {b.totalAmount?.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                    <Link
                                        href={`/user/bookings/detail/${b.id}`}
                                        className="px-4 py-2 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                                    >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

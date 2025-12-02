"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";                
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/booking-card";
import AdminBookingModal from "./_components/BookingModal";

export default function AdminBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(20);
    const [totalPages, setTotalPages] = useState<number>(0);

    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);
    
    // Load bookings
    useEffect(() => {
        if (userLoading) return;    
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadBookings() {
            try {
                setLoading(true);

                const res = await bookingService.list();
                setBookings(res?.items || []);
                setTotal(res?.total || 0);
                setPage(res?.page || 1);
                setLimit(res?.limit || 20);
            } catch (err) {
                console.error("Load bookings failed:", err);
                setError("Không thể tải danh sách booking");
            } finally {
                setLoading(false);
            }
        }

        loadBookings();
    }, [user, userLoading]);

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Bàn Booking Toàn Hệ Thống
            </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Tất cả lượt đặt xe từ mọi chi nhánh, hiển thị dạng thẻ game.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng booking</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* Body */}
            {loading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
            ) : bookings.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Hiện chưa có booking nào trong hệ thống.</p>
                    </div>
            ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {bookings.map((b) => (
                            <BookingCard
                                key={b.id}
                                booking={b}
                                onClick={() => {
                                    setSelectedBooking(b);
                                    setOpenModal(true);
                                }}
                            />
                    ))}
                </div>
                )}
            </div>
            {openModal && (
                <AdminBookingModal
                    booking={selectedBooking}
                    onClose={() => {
                        setOpenModal(false);
                        setSelectedBooking(null);
                    }}
                />
            )}
        </div>
    );
}
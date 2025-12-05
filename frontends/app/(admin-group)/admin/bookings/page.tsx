"use client";

import { useCallback, useEffect, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/booking-card";
import AdminBookingModal from "./_components/BookingModal";

export default function AdminBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteQuery({
        queryKey: ["admin-bookings", debouncedSearch],
        queryFn: async ({ pageParam = 1 }) => bookingService.list({
            page: pageParam,
            limit: 20,
            search: debouncedSearch || undefined,
        }),
        getNextPageParam: (lastPage: any) => {
            const currentPage = Number(lastPage?.page) || 1;
            const totalPages = Number(lastPage?.totalPages) || 1;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: !userLoading && !!user && user.role === "ADMIN",
        refetchOnWindowFocus: false,
    });

    const bookings = data?.pages.flatMap((page: any) => page?.items || []) || [];
    const total = data?.pages?.[0]?.total || 0;

    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (userLoading) {
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
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-3 sm:p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Quản lý Booking
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Tất cả lượt đặt xe từ mọi chi nhánh
                        </p>
                    </div>
                    <div className="rounded-lg sm:rounded-xl border border-slate-700 bg-slate-900/70 px-3 sm:px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng booking</p>
                        <p className="text-base sm:text-lg font-semibold text-blue-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                <div className="mb-4 sm:mb-6">
                    <input
                        placeholder="Tìm kiếm..."
                        className="w-full bg-slate-800/70 border border-slate-700 text-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {isLoading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                            <span className="text-gray-400">Đang tải booking...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">Không thể tải danh sách booking.</p>
                        {error && typeof error === "object" && "message" in (error as any) ? (
                            <p className="mt-2 text-sm text-red-300">{(error as any).message}</p>
                        ) : null}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Không tìm thấy booking nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                            {bookings.map((b: any) => (
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

                        {hasNextPage && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isFetchingNextPage}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Đang tải...
                                        </span>
                                    ) : (
                                        "Tải thêm"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}

                {openModal && selectedBooking && (
                    <AdminBookingModal
                        booking={selectedBooking}
                        onClose={() => {
                            setOpenModal(false);
                            setSelectedBooking(null);
                            refetch();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

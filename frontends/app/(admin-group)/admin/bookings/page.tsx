"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/booking-card";
import AdminBookingModal from "./_components/BookingModal";
import ExportButtons from "@/components/common/ExportButtons";

export default function AdminBookingsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteQuery({
        queryKey: ["admin-bookings", search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await bookingService.list({
                page: pageParam,
                limit: 20,
                search: search || undefined
            });
            return res?.data || res;
        },
        getNextPageParam: (lastPage: any) => {
            const currentPage = lastPage?.page || 1;
            const totalPages = lastPage?.totalPages || 1;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        initialPageParam: 1,
    });

    // Flatten all pages into single array
    const bookings = data?.pages.flatMap((page: any) => page?.items || []) || [];
    const total = data?.pages[0]?.total || 0;
    
    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            refetch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, refetch]);

    // Load more handler
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-3 sm:p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Quản lý Booking
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Tất cả lượt đặt xe từ mọi chi nhánh
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="rounded-lg sm:rounded-xl border border-slate-700 bg-slate-900/70 px-3 sm:px-4 py-2 text-right flex-1">
                            <p className="text-xs uppercase text-slate-500">Tổng booking</p>
                            <p className="text-base sm:text-lg font-semibold text-blue-400">
                                {total.toLocaleString("vi-VN")}
                            </p>
                        </div>
                        <ExportButtons
                            exportExcelUrl={`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001'}/api/reports/bookings/export-excel`}
                            exportPdfUrl={`${process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:3001'}/api/reports/bookings/export-pdf`}
                            filename="bookings-report"
                        />
                    </div>
                </div>

                {/* Search */}
                <div className="mb-4 sm:mb-6">
                    <input
                        placeholder="Tìm kiếm..."
                        className="w-full bg-slate-800/70 border border-slate-700 text-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Body */}
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
                                        setSelected(b);
                                        setOpen(true);
                                }}
                            />
                    ))}
                </div>
                        
                        {/* Load More Button */}
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

                {/* Modal */}
                {open && (
                <AdminBookingModal
                        booking={selected}
                    onClose={() => {
                            setOpen(false);
                            setSelected(null);
                            refetch();
                    }}
                />
            )}
            </div>
        </div>
    );
}
"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";
import { vehicleService } from "@/services/vehicle.service";
import VehicleModal from "./_components/vehicle-modal";
import VehicleCard from "./_components/VehicleCard";

export default function VehiclePage() {
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
        queryKey: ["vehicles", search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await vehicleService.getAll({
                page: pageParam,
                limit: 12,
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
    const vehicles = data?.pages.flatMap((page: any) => page?.items || []) || [];

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

    async function handleDelete(id: string) {
        if (!confirm("Bạn có chắc muốn xóa xe này?")) return;
        await vehicleService.delete(id);
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    }

    const handleEdit = (vehicle: any) => {
        setSelected(vehicle);
        setOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-3 sm:p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Quản lý Xe
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Quản lý đội xe với thương hiệu, chi nhánh và bảng giá.
                        </p>
                </div>
                <button
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                        + Thêm Xe
                </button>
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
                            <span className="text-gray-400">Đang tải xe...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">Không thể tải danh sách xe.</p>
                    </div>
                ) : vehicles.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Không tìm thấy xe nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                            {vehicles.map((vehicle: any) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
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
                <VehicleModal
                    open={open}
                    selected={selected}
                    onClose={() => {
                        setOpen(false);
                            refetch();
                    }}
                />
            )}
            </div>
        </div>
    );
}

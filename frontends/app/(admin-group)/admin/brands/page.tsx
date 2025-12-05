"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { brandService } from "@/services/brand.service";
import { useState, useCallback, useEffect } from "react";
import BrandModal from "./_components/brand-modal";
import BrandCard from "./_components/BrandCard";

export default function BrandPage() {
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
        queryKey: ["brands", search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await brandService.getAll({
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
    const brands = data?.pages.flatMap((page: any) => page?.items || []) || [];

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
        if (!confirm("Bạn có chắc muốn xóa thương hiệu này?")) return;

        await brandService.delete(id);
        queryClient.invalidateQueries({ queryKey: ["brands"] });
    }

    const handleEdit = (brand: any) => {
        setSelected(brand);
        setOpen(true);
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Thương Hiệu
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý thương hiệu xe trong hệ thống.
                        </p>
                    </div>
                <button
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                        + Thêm Thương Hiệu
                </button>
            </div>

                {/* Search */}
                <div className="mb-6">
            <input
                        placeholder="Tìm kiếm theo tên, slug hoặc quốc gia..."
                        className="w-full sm:w-80 bg-slate-800/70 border border-slate-700 text-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
                </div>

                {/* Body */}
                {isLoading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                            <span className="text-gray-400">Đang tải thương hiệu...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">Không thể tải thương hiệu.</p>
                    </div>
                ) : brands.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Không tìm thấy thương hiệu nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {brands.map((brand: any) => (
                                <BrandCard
                                    key={brand.id}
                                    brand={brand}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
<<<<<<< HEAD
=======

>>>>>>> b9b3026 (update layout)
                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isFetchingNextPage}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
<<<<<<< HEAD
                                </button>
=======
>>>>>>> b9b3026 (update layout)
                            </div>
                        )}
                    </>
                )}

                {/* Modal */}
            {open && (
                <BrandModal
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

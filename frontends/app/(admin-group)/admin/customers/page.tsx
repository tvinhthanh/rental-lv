"use client";

import { useState, useEffect } from "react";
import { useInfiniteQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import CustomerModal from "./_components/customer-modal";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteQuery({
        queryKey: ["admin-customers", search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await customerService.getAll({
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
    const customers = data?.pages.flatMap((page: any) => page?.items || []) || [];
    const total = data?.pages[0]?.total || 0;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            refetch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, refetch]);

    // Load more handler
    const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => customerService.delete(id),
        onSuccess: () => {
            toast.success("Đã xóa khách hàng");
            queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Xóa thất bại"),
    });

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-3 sm:p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Quản lý Khách Hàng
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Danh sách khách hàng và điểm thưởng
                        </p>
                </div>
                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                        className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                        + Thêm Khách Hàng
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
                            <span className="text-gray-400">Đang tải khách hàng...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">Không thể tải danh sách khách hàng.</p>
                    </div>
                ) : customers.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Không tìm thấy khách hàng nào.</p>
                    </div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="block sm:hidden space-y-3">
                            {customers.map((c: any) => (
                                <div key={c.id} className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-100 mb-1">{c.fullName}</h3>
                                            <p className="text-xs text-gray-400">{c.phone}</p>
                                            {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-900/30 text-purple-300">
                                            {c.membershipTier ?? "BASIC"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-300 mb-3">
                                        <span>Điểm: <strong>{c.loyaltyPoints ?? 0}</strong></span>
                                        {c.isVerified ? (
                                            <span className="text-green-400">✓ Đã xác thực</span>
                                        ) : (
                                            <span className="text-slate-400">Chưa xác thực</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors"
                                            onClick={() => { setSelected(c); setOpen(true); }}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors"
                                            onClick={() => {
                                                if (!confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
                                                deleteMutation.mutate(c.id);
                                            }}
                                        >
                                            Xóa
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/70">
                            <table className="w-full">
                                <thead className="bg-slate-800 border-b border-slate-700">
                        <tr>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Tên</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Số Điện Thoại</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300 hidden md:table-cell">Email</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Hạng</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Điểm</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300 hidden lg:table-cell">Xác Thực</th>
                                        <th className="p-3 sm:p-4 text-left text-xs sm:text-sm font-semibold text-gray-300">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                                    {customers.map((c: any) => (
                                        <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-200">{c.fullName}</td>
                                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-200">{c.phone}</td>
                                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-200 hidden md:table-cell">{c.email ?? "-"}</td>
                                            <td className="p-3 sm:p-4">
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-900/30 text-purple-300">
                                                    {c.membershipTier ?? "BASIC"}
                                                </span>
                                            </td>
                                            <td className="p-3 sm:p-4 text-xs sm:text-sm text-gray-200">{c.loyaltyPoints ?? 0}</td>
                                            <td className="p-3 sm:p-4 hidden lg:table-cell">
                                                {c.isVerified ? (
                                                    <span className="text-xs sm:text-sm text-green-400">✓ Đã xác thực</span>
                                                ) : (
                                                    <span className="text-xs sm:text-sm text-slate-400">Chưa xác thực</span>
                                                )}
                                            </td>
                                            <td className="p-3 sm:p-4">
                                                <div className="flex items-center gap-2 sm:gap-3">
                                    <button
                                                        className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        onClick={() => { setSelected(c); setOpen(true); }}
                                    >
                                                        Sửa
                                    </button>
                                    <button
                                                        className="text-xs sm:text-sm text-red-400 hover:text-red-300 transition-colors"
                                        onClick={() => {
                                                            if (!confirm("Bạn có chắc muốn xóa khách hàng này?")) return;
                                            deleteMutation.mutate(c.id);
                                        }}
                                    >
                                                        Xóa
                                    </button>
                                                </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                <CustomerModal
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

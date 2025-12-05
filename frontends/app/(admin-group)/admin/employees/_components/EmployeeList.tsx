'use client';

import { useState, useCallback, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { employeeService } from "@/services/employee.service";
import EmployeeModal from "./EmployeeModal";
import EmployeeCard from "./EmployeeCard";

//  NORMALIZE HÀM DÙNG CHUNG
const normalizeList = (res: any) => {
    if (!res) return [];

    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.list)) return res.list;

    return []; // fallback
};

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "text-green-400",
    INACTIVE: "text-red-400",
    ON_LEAVE: "text-yellow-300",
};

export default function EmployeeList() {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [selected, setSelected] = useState<any>(null);
    const [search, setSearch] = useState("");

    //  INFINITE QUERY FOR PAGINATION
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ["employees", search],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await employeeService.getAll({
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
    const employees = data?.pages.flatMap((page: any) => page?.items || []) || [];

    //  ACTION HANDLERS
    const handleAdd = () => {
        setSelected(null);
        setMode("create");
        setOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelected(item);
        setMode("edit");
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc muốn xóa?")) {
            await employeeService.delete(id);
            refetch();
        }
    };

    // Load more handler
    const handleLoadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const formatDate = (value?: string) => {
        if (!value) return "-";
        const d = new Date(value);
        return d.toLocaleDateString();
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            refetch();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, refetch]);

        //  RENDER
    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Nhân Viên
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý nhân viên trong hệ thống.
                        </p>
                    </div>
                <button
                    onClick={handleAdd}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                >
                        + Thêm Nhân Viên
                </button>
            </div>

                {/* Search */}
                <div className="mb-6">
            <input
                type="text"
                        placeholder="Tìm kiếm theo tên, số điện thoại hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-80 bg-slate-800/70 border border-slate-700 text-gray-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-500"
            />
                </div>

                {/* Body */}
            {isLoading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                            <span className="text-gray-400">Đang tải nhân viên...</span>
                        </div>
                    </div>
                ) : employees.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Không tìm thấy nhân viên nào.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {employees.map((emp: any) => (
                                <EmployeeCard
                                    key={emp.id}
                                    employee={emp}
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
                                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>

            {open && (
                <EmployeeModal
                    mode={mode}
                    data={selected}
                    onClose={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false);
                        refetch();
                    }}
                />
            )}
        </div>
    );
}

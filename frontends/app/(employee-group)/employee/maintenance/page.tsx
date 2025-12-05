"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useEmployee } from "@/hooks/useEmployee";
import { maintenanceService } from "@/services/maintenance.service";
import { getImageUrl } from "@/lib/image-placeholder";
import MaintenanceModal from "./_component/MaintenanceModal";

export default function MaintenancePage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { employee, loading: employeeLoading } = useEmployee();
    const [search, setSearch] = useState("");
    const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch
    } = useInfiniteQuery({
        queryKey: ["employee-maintenance", employee?.branchId, search],
        queryFn: async ({ pageParam = 1 }) => {
            if (!employee?.branchId) return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
            
            const res = await maintenanceService.getByBranch(employee.branchId);
            const list = res?.items || res?.data?.items || (Array.isArray(res) ? res : []);
            
            // Filter by search and status
            let filtered = list;
            if (search) {
                filtered = filtered.filter((m: any) => 
                    m.vehicle?.name?.toLowerCase().includes(search.toLowerCase()) ||
                    m.vehicle?.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
                    m.description?.toLowerCase().includes(search.toLowerCase())
                );
            }
            
            // Only show active maintenance (IN_PROGRESS, PENDING, or not completed)
            filtered = filtered.filter((m: any) => 
                m.status === "IN_PROGRESS" || 
                m.status === "PENDING" || 
                !m.completedAt
            );
            
            // Simple pagination
            const limit = 20;
            const page = pageParam;
            const start = (page - 1) * limit;
            const end = start + limit;
            
            return {
                items: filtered.slice(start, end),
                total: filtered.length,
                page,
                limit,
                totalPages: Math.ceil(filtered.length / limit)
            };
        },
        getNextPageParam: (lastPage: any) => {
            const currentPage = lastPage?.page || 1;
            const totalPages = lastPage?.totalPages || 1;
            return currentPage < totalPages ? currentPage + 1 : undefined;
        },
        enabled: !!employee?.branchId && !userLoading && !employeeLoading,
        initialPageParam: 1,
    });

    // Flatten all pages into single array
    const maintenances = data?.pages.flatMap((page: any) => page?.items || []) || [];
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

    const loading = userLoading || employeeLoading || isLoading;

    // Guards
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="text-gray-400">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (!user || user.role !== "EMPLOYEE") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Không tìm thấy thông tin nhân viên.</p>
            </div>
        );
    }

    if (!employee.branchId) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-yellow-400">Bạn chưa được phân công vào chi nhánh nào.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100 p-3 sm:p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Quản lý Bảo Dưỡng
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Chi nhánh: <span className="text-blue-400">{employee.branch?.name || employee.branchId}</span>
                        </p>
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
                {isError ? (
                    <div className="mt-6 sm:mt-10 rounded-xl sm:rounded-2xl border border-red-700 bg-red-900/20 py-8 sm:py-12 text-center px-4">
                        <p className="text-sm sm:text-base text-red-400">Không thể tải danh sách bảo dưỡng.</p>
                    </div>
                ) : maintenances.length === 0 ? (
                    <div className="mt-6 sm:mt-10 rounded-xl sm:rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-8 sm:py-12 text-center px-4">
                        <p className="text-sm sm:text-base text-slate-400">Không có bảo dưỡng nào đang diễn ra.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                            {maintenances.map((m: any) => (
                                <div
                                    key={m.id}
                                    onClick={() => setSelectedMaintenance(m)}
                                    className="bg-slate-900/70 border border-slate-700 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 hover:border-orange-400/50 active:scale-[0.98] cursor-pointer transition-all shadow-lg hover:shadow-xl"
                                >
                                    {m.vehicle?.photos?.[0] && (
                                        <img
                                            src={getImageUrl(m.vehicle.photos[0])}
                                            alt={m.vehicle.name}
                                            className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3 sm:mb-4 border border-slate-700"
                                        />
                                    )}
                                    
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-100 mb-1 sm:mb-2 line-clamp-1">
                                        {m.vehicle?.name || "Không có tên"}
                                    </h3>
                                    
                                    <p className="text-xs sm:text-sm text-gray-300 mb-1">
                                        Biển số: <span className="text-gray-200">{m.vehicle?.licensePlate || "N/A"}</span>
                                    </p>
                                    
                                    {m.description && (
                                        <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3 line-clamp-2">
                                            {m.description}
                                        </p>
                                    )}
                                    
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mt-3 sm:mt-4">
                                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                            m.status === "IN_PROGRESS" 
                                                ? "bg-orange-600/20 text-orange-400 border border-orange-700"
                                                : m.status === "PENDING"
                                                ? "bg-yellow-600/20 text-yellow-400 border border-yellow-700"
                                                : "bg-blue-600/20 text-blue-400 border border-blue-700"
                                        }`}>
                                            {m.status === "IN_PROGRESS" ? "Đang bảo dưỡng" : 
                                             m.status === "PENDING" ? "Chờ xử lý" : 
                                             "Đang xử lý"}
                                        </span>
                                        
                                        {m.scheduledDate && (
                                            <span className="text-xs text-slate-400">
                                                {new Date(m.scheduledDate).toLocaleDateString("vi-VN")}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Load More Button */}
                        {hasNextPage && (
                            <div className="mt-6 sm:mt-8 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isFetchingNextPage}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm sm:text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isFetchingNextPage ? (
                                        <span className="flex items-center justify-center gap-2">
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
                {selectedMaintenance && (
                    <MaintenanceModal
                        vehicle={selectedMaintenance.vehicle}
                        maintenance={selectedMaintenance}
                        onClose={() => {
                            setSelectedMaintenance(null);
                            refetch();
                        }}
                    />
                )}
            </div>
        </div>
    );
}

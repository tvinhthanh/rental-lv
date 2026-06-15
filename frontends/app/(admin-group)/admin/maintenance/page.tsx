"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { maintenanceService } from "@/services/maintenance.service";
import { branchService } from "@/services/branch.service";
import { Wrench } from "lucide-react";

export default function AdminMaintenancePage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedMaintenance, setSelectedMaintenance] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadMaintenances() {
            try {
                setLoading(true);
                const branchesRes = await branchService.getAll();
                const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.items || []);
                
                const allMaintenances: any[] = [];
                for (const branch of branches) {
                    try {
                        const res = await maintenanceService.getByBranch(branch.id);
                        const items = Array.isArray(res) ? res : (res?.items || []);
                        
                        for (const maintenance of items) {
                            allMaintenances.push({
                                ...maintenance,
                                branchName: branch.name,
                            });
                        }
                    } catch (err) {
                        console.error(`Load maintenances for branch ${branch.id} failed:`, err);
                    }
                }

                allMaintenances.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });

                setMaintenances(allMaintenances);
                setTotal(allMaintenances.length);
            } catch (err) {
                console.error("Load maintenances failed:", err);
                setError("Không thể tải danh sách bảo dưỡng");
            } finally {
                setLoading(false);
            }
        }

        loadMaintenances();
    }, [user, userLoading]);

    if (userLoading || loading) {
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

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-400",
        IN_PROGRESS: "bg-blue-500/20 text-blue-400",
        COMPLETED: "bg-emerald-500/20 text-emerald-400",
        CANCELLED: "bg-red-500/20 text-red-400",
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Bảo Dưỡng
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả hoạt động bảo dưỡng xe trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng bảo dưỡng</p>
                        <p className="text-lg font-semibold text-orange-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {maintenances.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <Wrench className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có bảo dưỡng nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {maintenances.map((maintenance) => (
                            <div
                                key={maintenance.id}
                                onClick={() => {
                                    setSelectedMaintenance(maintenance);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-orange-400/50 hover:shadow-lg hover:shadow-orange-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="w-5 h-5 text-orange-400" />
                                        <span className="text-sm font-semibold text-orange-400">
                                            {maintenance.vehicle?.name || maintenance.vehicleId || "—"}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${statusColors[maintenance.status] || statusColors.PENDING}`}>
                                        {maintenance.status === 'PENDING' ? 'Chờ xử lý' : maintenance.status === 'IN_PROGRESS' ? 'Đang thực hiện' : maintenance.status === 'COMPLETED' ? 'Đã hoàn thành' : maintenance.status === 'CANCELLED' ? 'Đã hủy' : maintenance.status || 'Chờ xử lý'}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Xe:</span> {maintenance.vehicle?.name || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Loại:</span> {maintenance.type || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Chi nhánh:</span> {maintenance.branchName || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openModal && selectedMaintenance && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Chi Tiết Bảo Dưỡng</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Xe: {selectedMaintenance.vehicle?.name || selectedMaintenance.vehicleId || "—"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-slate-400">Trạng thái</p>
                                    <p className={`text-lg font-semibold ${statusColors[selectedMaintenance.status] || statusColors.PENDING}`}>
                                        {selectedMaintenance.status === 'PENDING' ? 'Chờ xử lý' : selectedMaintenance.status === 'IN_PROGRESS' ? 'Đang thực hiện' : selectedMaintenance.status === 'COMPLETED' ? 'Đã hoàn thành' : selectedMaintenance.status === 'CANCELLED' ? 'Đã hủy' : selectedMaintenance.status || 'Chờ xử lý'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Xe</p>
                                    <p className="text-white">{selectedMaintenance.vehicle?.name || selectedMaintenance.vehicleId || "—"}</p>
                                    <p className="text-slate-400">{selectedMaintenance.vehicle?.licensePlate || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Loại bảo dưỡng</p>
                                    <p className="text-white">{selectedMaintenance.type || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Chi nhánh</p>
                                    <p className="text-white">{selectedMaintenance.branchName || "—"}</p>
                                </div>

                                {selectedMaintenance.description && (
                                    <div>
                                        <p className="text-slate-400">Mô tả</p>
                                        <p className="text-white">{selectedMaintenance.description}</p>
                                    </div>
                                )}

                                {selectedMaintenance.cost && (
                                    <div>
                                        <p className="text-slate-400">Chi phí</p>
                                        <p className="text-lg font-bold text-orange-400">
                                            {selectedMaintenance.cost.toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                )}

                                {selectedMaintenance.startDate && (
                                    <div>
                                        <p className="text-slate-400">Ngày bắt đầu</p>
                                        <p className="text-white">
                                            {new Date(selectedMaintenance.startDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedMaintenance.completedAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày hoàn thành</p>
                                        <p className="text-white">
                                            {new Date(selectedMaintenance.completedAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedMaintenance.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedMaintenance.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

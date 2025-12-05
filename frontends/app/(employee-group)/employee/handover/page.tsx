"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { rentalProcessService } from "@/services/rental-process.service";
import HandoverModal from "./_components/HandoverModal";
import CreateHandoverModal from "./_components/CreateHandoverModal";

function HandoversContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const searchParams = useSearchParams();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [handovers, setHandovers] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedHandover, setSelectedHandover] = useState<any | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            setLoading(false);
            return;
        }

        async function loadEmployee() {
            try {
                setLoadingEmployee(true);
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (e) {
                console.error("Load employee failed", e);
                setError("Không thể tải dữ liệu nhân viên");
            } finally {
                setLoadingEmployee(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadHandovers() {
            try {
                setLoading(true);
                const res = await rentalProcessService.handoversByBranch(employee.branchId);

                const items = Array.isArray(res?.items) ? res.items : [];
                const totalCount = res?.total ?? items.length;

                setHandovers(items);
                setTotal(totalCount);
            } catch (e) {
                console.error("Load handovers failed", e);
                setError("Không thể tải danh sách giao xe");
            } finally {
                setLoading(false);
            }
        }

        loadHandovers();
    }, [employee?.branchId]);

    // Check query param để tự động mở modal khi redirect từ create page
    useEffect(() => {
        const handoverId = searchParams.get("handoverId");
        if (handoverId && handovers.length > 0) {
            const handover = handovers.find((h) => h.id === handoverId);
            if (handover) {
                setSelectedHandover(handover);
                window.history.replaceState({}, "", "/employee/handover");
            }
        }
    }, [handovers, searchParams]);

    return (
        <div className="p-6 text-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        Danh sách giao xe
                    </h1>
                    <p className="text-sm text-slate-400">
                        Chi nhánh:{" "}
                        <span className="text-blue-400">
                            {employee?.branch?.name || employee?.branchId || "—"}
                        </span>{" "}
                        • Tổng: {total}
                    </p>
                </div>
                {employee?.branchId && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold"
                    >
                        + Tạo phiếu giao xe
                    </button>
                )}
            </div>

            {loading ? (
                <p>Đang tải danh sách giao xe...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : handovers.length === 0 ? (
                <p className="text-gray-400">Không có giao xe nào.</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Booking</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Khách hàng</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Xe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Số km đầu</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Mức nhiên liệu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Nơi nhận</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Nhân viên</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Ngày tạo</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {handovers.map((h) => (
                                    <tr
                                        key={h.id}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                        onClick={() => setSelectedHandover(h)}
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-slate-100">{h.booking?.bookingCode || "—"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-200">{h.booking?.customer?.fullName || "—"}</p>
                                            <p className="text-xs text-slate-400">{h.booking?.customer?.phone || ""}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-200">{h.booking?.vehicle?.name || "—"}</p>
                                            <p className="text-xs text-slate-400">{h.booking?.vehicle?.licensePlate || ""}</p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <p className="font-semibold text-blue-400">
                                                {h.odoStart ? h.odoStart.toLocaleString("vi-VN") : "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <p className="text-yellow-400">
                                                {h.fuelLevelStart !== null && h.fuelLevelStart !== undefined ? `${h.fuelLevelStart}%` : "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-300">{h.pickupPlace || "—"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-300">{h.employee?.fullName || h.handedOverBy || "—"}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-slate-400 text-xs">
                                                {h.createdAt ? new Date(h.createdAt).toLocaleDateString("vi-VN", {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit'
                                                }) : "—"}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedHandover(h);
                                                }}
                                                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                                            >
                                                Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {selectedHandover && (
                        <HandoverModal
                            handover={selectedHandover}
                            onClose={() => setSelectedHandover(null)}
                        />
                    )}

                    {showCreateModal && employee?.branchId && (
                        <CreateHandoverModal
                            branchId={employee.branchId}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => {
                                setShowCreateModal(false);
                                // Reload handovers
                                if (employee?.branchId) {
                                    rentalProcessService.handoversByBranch(employee.branchId).then((res) => {
                                        const items = Array.isArray(res?.items) ? res.items : [];
                                        const totalCount = res?.total ?? items.length;
                                        setHandovers(items);
                                        setTotal(totalCount);
                                    });
                                }
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function HandoversPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <HandoversContent />
        </Suspense>
    );
}

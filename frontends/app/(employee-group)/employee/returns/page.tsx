"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { bookingService } from "@/services/booking.service";
import ReturnModal from "./_components/ReturnModal";
import CreateReturnModal from "./_components/CreateReturnModal";

function ReturnsContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const searchParams = useSearchParams();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [returns, setReturns] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedReturn, setSelectedReturn] = useState<any | null>(null);
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

        async function loadReturns() {
            try {
                setLoading(true);
                const res = await rentalProcessService.returnsByBranch(employee.branchId);

                const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
                const totalCount = res?.total ?? items.length;
                setReturns(items);
                setTotal(totalCount);
            } catch (e) {
                console.error("Load returns failed", e);
                setError("Không thể tải danh sách phiếu trả xe");
            } finally {
                setLoading(false);
            }
        }

        loadReturns();
    }, [employee?.branchId]);

    useEffect(() => {
        const returnId = searchParams.get("returnId");
        if (returnId && returns.length > 0) {
            const returnReport = returns.find((r) => r.id === returnId);
            if (returnReport) {
                setSelectedReturn(returnReport);
                window.history.replaceState({}, "", "/employee/returns");
            }
        }
    }, [returns, searchParams]);

    return (
        <div className="p-6 text-gray-200">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-2">
                        Danh sách phiếu trả xe
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
                        + Tạo phiếu trả xe
                    </button>
                )}
            </div>

            {loading ? (
                <p>Đang tải danh sách phiếu trả xe...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : returns.length === 0 ? (
                <div className="space-y-4">
                    <p className="text-gray-400">Không có phiếu trả xe nào.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Booking</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Khách hàng</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Xe</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Số km cuối</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Mức nhiên liệu</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Phí phát sinh</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Tình trạng</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Ngày tạo</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {returns.map((r) => (
                                <tr
                                    key={r.id}
                                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    onClick={() => setSelectedReturn(r)}
                                >
                                    <td className="px-4 py-3">
                                        <p className="font-semibold text-slate-100">{r.booking?.bookingCode || "—"}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-200">{r.booking?.customer?.fullName || "—"}</p>
                                        <p className="text-xs text-slate-400">{r.booking?.customer?.phone || ""}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-200">{r.booking?.vehicle?.name || "—"}</p>
                                        <p className="text-xs text-slate-400">{r.booking?.vehicle?.licensePlate || ""}</p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="font-semibold text-blue-400">
                                            {r.odoEnd ? r.odoEnd.toLocaleString("vi-VN") : "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="text-yellow-400">
                                            {r.fuelLevelEnd !== null && r.fuelLevelEnd !== undefined ? `${r.fuelLevelEnd}%` : "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <p className="text-red-400">
                                            {r.extraCharge ? r.extraCharge.toLocaleString("vi-VN") + " đ" : "—"}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            r.condition === "GOOD" ? "bg-emerald-500/20 text-emerald-400" :
                                            r.condition === "FAIR" ? "bg-yellow-500/20 text-yellow-400" :
                                            r.condition === "POOR" ? "bg-red-500/20 text-red-400" :
                                            "bg-slate-500/20 text-slate-400"
                                        }`}>
                                            {r.condition || "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-slate-400 text-xs">
                                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN", {
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
                                                setSelectedReturn(r);
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
            )}

            {/* Modals - luôn hiển thị khi cần */}
            {selectedReturn && (
                <ReturnModal
                    returnReport={selectedReturn}
                    onClose={() => setSelectedReturn(null)}
                />
            )}

            {showCreateModal && employee?.branchId && (
                <CreateReturnModal
                    branchId={employee.branchId}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        // Reload returns
                        if (employee?.branchId) {
                            rentalProcessService.returnsByBranch(employee.branchId).then((res) => {
                                const items = Array.isArray(res?.items) ? res.items : [];
                                const totalCount = res?.total ?? items.length;
                                setReturns(items);
                                setTotal(totalCount);
                            });
                        }
                    }}
                />
            )}
        </div>
    );
}

export default function ReturnsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <ReturnsContent />
        </Suspense>
    );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { depositService } from "@/services/deposit.service";
import DepositModal from "./_components/DepositModal";
import { translateStatus } from "@/lib/utils";

function DepositsContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const searchParams = useSearchParams();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [deposits, setDeposits] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);

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

        async function loadDeposits() {
            try {
                setLoading(true);
                const res = await depositService.findByBranch(employee.branchId);

                const items = Array.isArray(res?.items) ? res.items : [];
                const totalCount = res?.total ?? items.length;

                setDeposits(items);
                setTotal(totalCount);
            } catch (e) {
                console.error("Load deposits failed", e);
                setError("Không thể tải danh sách tiền đặt cọc");
            } finally {
                setLoading(false);
            }
        }

        loadDeposits();
    }, [employee?.branchId]);

    // Check query param để tự động mở modal khi redirect từ create page
    useEffect(() => {
        const depositId = searchParams.get("depositId");
        if (depositId && deposits.length > 0) {
            const deposit = deposits.find((d) => d.id === depositId);
            if (deposit) {
                setSelectedDeposit(deposit);
                window.history.replaceState({}, "", "/employee/deposits");
            }
        }
    }, [deposits, searchParams]);

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-2">
                Danh sách tiền đặt cọc
            </h1>
            <p className="mb-4 text-sm text-slate-400">
                Chi nhánh:{" "}
                <span className="text-blue-400">
                    {employee?.branch?.name || employee?.branchId || "—"}
                </span>{" "}
                • Tổng: {total}
            </p>

            {loading ? (
                <p>Đang tải tiền đặt cọc...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : deposits.length === 0 ? (
                <p className="text-gray-400">Không có tiền đặt cọc nào.</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Booking</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Khách hàng</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Xe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Tổng tiền</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Đã sử dụng</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Đã hoàn</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Ngày tạo</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deposits.map((d) => {
                                    const remaining = (d.totalAmount || 0) - (d.usedAmount || 0) - (d.refundedAmount || 0);
                                    return (
                                        <tr
                                            key={d.id}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedDeposit(d)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-100">{d.booking?.bookingCode || "—"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-200">{d.booking?.customer?.fullName || d.customer?.fullName || "—"}</p>
                                                <p className="text-xs text-slate-400">{d.booking?.customer?.phone || d.customer?.phone || ""}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-200">{d.booking?.vehicle?.name || "—"}</p>
                                                <p className="text-xs text-slate-400">{d.booking?.vehicle?.licensePlate || ""}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="font-semibold text-emerald-400">
                                                    {d.totalAmount?.toLocaleString("vi-VN")} đ
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="text-yellow-400">
                                                    {d.usedAmount?.toLocaleString("vi-VN") || 0} đ
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="text-blue-400">
                                                    {d.refundedAmount?.toLocaleString("vi-VN") || 0} đ
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    d.status === "HELD" ? "bg-blue-500/20 text-blue-400" :
                                                    d.status === "REFUNDED" ? "bg-emerald-500/20 text-emerald-400" :
                                                    "bg-slate-500/20 text-slate-400"
                                                }`}>
                                                    {translateStatus(d.status, 'deposit')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-400 text-xs">
                                                    {d.createdAt ? new Date(d.createdAt).toLocaleDateString("vi-VN", {
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
                                                        setSelectedDeposit(d);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs"
                                                >
                                                    Xem
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {selectedDeposit && (
                        <DepositModal
                            deposit={selectedDeposit}
                            onClose={() => setSelectedDeposit(null)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function DepositsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <DepositsContent />
        </Suspense>
    );
}

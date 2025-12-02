"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { depositService } from "@/services/deposit.service";
import { branchService } from "@/services/branch.service";
import { Wallet } from "lucide-react";

export default function AdminDepositsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [deposits, setDeposits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadDeposits() {
            try {
                setLoading(true);
                // Lấy tất cả branches
                const branchesRes = await branchService.getAll();
                const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.items || []);
                
                // Lấy deposits từ tất cả branches
                const allDeposits: any[] = [];
                for (const branch of branches) {
                    try {
                        const res = await depositService.findByBranch(branch.id);
                        const items = Array.isArray(res?.items) ? res.items : [];
                        
                        for (const deposit of items) {
                            allDeposits.push({
                                ...deposit,
                                branchName: branch.name,
                            });
                        }
                    } catch (err) {
                        console.error(`Load deposits for branch ${branch.id} failed:`, err);
                    }
                }

                // Sắp xếp theo ngày mới nhất
                allDeposits.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });

                setDeposits(allDeposits);
                setTotal(allDeposits.length);
            } catch (err) {
                console.error("Load deposits failed:", err);
                setError("Không thể tải danh sách tiền đặt cọc");
            } finally {
                setLoading(false);
            }
        }

        loadDeposits();
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

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Tiền Đặt Cọc
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả tiền đặt cọc trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng đặt cọc</p>
                        <p className="text-lg font-semibold text-yellow-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Deposits Grid */}
                {deposits.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <Wallet className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có tiền đặt cọc nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {deposits.map((deposit) => (
                            <div
                                key={deposit.id}
                                onClick={() => {
                                    setSelectedDeposit(deposit);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-yellow-400/50 hover:shadow-lg hover:shadow-yellow-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="w-5 h-5 text-yellow-400" />
                                        <span className="text-sm font-semibold text-yellow-400">
                                            {deposit.booking?.bookingCode || deposit.bookingId || "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Khách hàng:</span> {deposit.booking?.customer?.fullName || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Chi nhánh:</span> {deposit.branchName || "—"}
                                    </p>
                                    <p className="text-lg font-bold text-yellow-400">
                                        {deposit.amount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {openModal && selectedDeposit && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Chi Tiết Tiền Đặt Cọc
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Booking: {selectedDeposit.booking?.bookingCode || selectedDeposit.bookingId || "—"}
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
                                    <p className="text-slate-400">Số tiền</p>
                                    <p className="text-2xl font-bold text-yellow-400">
                                        {selectedDeposit.amount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Khách hàng</p>
                                    <p className="text-white">{selectedDeposit.booking?.customer?.fullName || "—"}</p>
                                    <p className="text-slate-400">{selectedDeposit.booking?.customer?.phone || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Booking</p>
                                    <p className="text-white">{selectedDeposit.booking?.bookingCode || selectedDeposit.bookingId || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Chi nhánh</p>
                                    <p className="text-white">{selectedDeposit.branchName || "—"}</p>
                                </div>

                                {selectedDeposit.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedDeposit.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedDeposit.note && (
                                    <div>
                                        <p className="text-slate-400">Ghi chú</p>
                                        <p className="text-white">{selectedDeposit.note}</p>
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

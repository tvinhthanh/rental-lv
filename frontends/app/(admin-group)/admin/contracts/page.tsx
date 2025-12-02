"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { rentalProcessService } from "@/services/rental-process.service";
import { branchService } from "@/services/branch.service";
import { FileText } from "lucide-react";

export default function AdminContractsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedContract, setSelectedContract] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadContracts() {
            try {
                setLoading(true);
                const branchesRes = await branchService.getAll();
                const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.items || []);
                
                const allContracts: any[] = [];
                for (const branch of branches) {
                    try {
                        const res = await rentalProcessService.contractsByBranch(branch.id);
                        const items = Array.isArray(res?.items) ? res.items : [];
                        
                        for (const contract of items) {
                            allContracts.push({
                                ...contract,
                                branchName: branch.name,
                            });
                        }
                    } catch (err) {
                        console.error(`Load contracts for branch ${branch.id} failed:`, err);
                    }
                }

                allContracts.sort((a, b) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });

                setContracts(allContracts);
                setTotal(allContracts.length);
            } catch (err) {
                console.error("Load contracts failed:", err);
                setError("Không thể tải danh sách hợp đồng");
            } finally {
                setLoading(false);
            }
        }

        loadContracts();
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
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Hợp Đồng
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả hợp đồng trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng hợp đồng</p>
                        <p className="text-lg font-semibold text-cyan-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {contracts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có hợp đồng nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {contracts.map((contract) => (
                            <div
                                key={contract.id}
                                onClick={() => {
                                    setSelectedContract(contract);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-cyan-400" />
                                        <span className="text-sm font-semibold text-cyan-400">
                                            {contract.contractNo || contract.booking?.bookingCode || "—"}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Khách hàng:</span> {contract.booking?.customer?.fullName || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Booking:</span> {contract.booking?.bookingCode || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Chi nhánh:</span> {contract.branchName || "—"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openModal && selectedContract && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Chi Tiết Hợp Đồng</h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Mã: {selectedContract.contractNo || selectedContract.booking?.bookingCode || "—"}
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
                                    <p className="text-slate-400">Khách hàng</p>
                                    <p className="text-white">{selectedContract.booking?.customer?.fullName || "—"}</p>
                                    <p className="text-slate-400">{selectedContract.booking?.customer?.phone || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Booking</p>
                                    <p className="text-white">{selectedContract.booking?.bookingCode || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Chi nhánh</p>
                                    <p className="text-white">{selectedContract.branchName || "—"}</p>
                                </div>

                                {selectedContract.createdAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày tạo</p>
                                        <p className="text-white">
                                            {new Date(selectedContract.createdAt).toLocaleDateString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedContract.pdfUrl && (
                                    <div>
                                        <a
                                            href={selectedContract.pdfUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            Xem PDF hợp đồng
                                        </a>
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

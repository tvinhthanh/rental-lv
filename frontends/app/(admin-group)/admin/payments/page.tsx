"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import { branchService } from "@/services/branch.service";
import { CreditCard } from "lucide-react";
import { translateStatus } from "@/lib/utils";

export default function AdminPaymentsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") return;

        async function loadPayments() {
            try {
                setLoading(true);
                // Lấy tất cả branches
                const branchesRes = await branchService.getAll();
                const branches = Array.isArray(branchesRes) ? branchesRes : (branchesRes?.items || []);
                
                // Lấy payments từ tất cả branches
                const allPayments: any[] = [];
                for (const branch of branches) {
                    try {
                        const invoicesRes = await billingService.invoicesByBranch(branch.id);
                        const invoices = Array.isArray(invoicesRes?.items) ? invoicesRes.items : [];
                        
                        for (const invoice of invoices) {
                            if (invoice.payments && Array.isArray(invoice.payments)) {
                                for (const payment of invoice.payments) {
                                    allPayments.push({
                                        ...payment,
                                        invoiceNo: invoice.invoiceNo,
                                        invoiceId: invoice.id,
                                        invoice: invoice,
                                        bookingCode: invoice.booking?.bookingCode,
                                        customerName: invoice.booking?.customer?.fullName || invoice.customer?.fullName,
                                        vehicleName: invoice.booking?.vehicle?.name,
                                        licensePlate: invoice.booking?.vehicle?.licensePlate,
                                        branchName: branch.name,
                                    });
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Load payments for branch ${branch.id} failed:`, err);
                    }
                }

                // Sắp xếp theo ngày mới nhất
                allPayments.sort((a, b) => {
                    const dateA = new Date(a.paidAt || a.createdAt).getTime();
                    const dateB = new Date(b.paidAt || b.createdAt).getTime();
                    return dateB - dateA;
                });

                setPayments(allPayments);
                setTotal(allPayments.length);
            } catch (err) {
                console.error("Load payments failed:", err);
                setError("Không thể tải danh sách thanh toán");
            } finally {
                setLoading(false);
            }
        }

        loadPayments();
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

    const methodColors: Record<string, string> = {
        CASH: "bg-green-500/20 text-green-400",
        BANK_TRANSFER: "bg-blue-500/20 text-blue-400",
        CREDIT_CARD: "bg-purple-500/20 text-purple-400",
        DEBIT_CARD: "bg-indigo-500/20 text-indigo-400",
        E_WALLET: "bg-yellow-500/20 text-yellow-400",
        OTHER: "bg-slate-500/20 text-slate-400",
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Thanh Toán
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả giao dịch thanh toán trong hệ thống
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng thanh toán</p>
                        <p className="text-lg font-semibold text-emerald-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Payments Grid */}
                {payments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <CreditCard className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có giao dịch thanh toán nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                onClick={() => {
                                    setSelectedPayment(payment);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-emerald-400/50 hover:shadow-lg hover:shadow-emerald-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-emerald-400" />
                                        <span className="text-sm font-semibold text-emerald-400">
                                            {payment.invoiceNo || "—"}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${methodColors[payment.method] || methodColors.OTHER}`}>
                                        {translateStatus(payment.method, 'payment')}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Khách hàng:</span> {payment.customerName || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Booking:</span> {payment.bookingCode || "—"}
                                    </p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {payment.amount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {openModal && selectedPayment && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Chi Tiết Thanh Toán
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Mã HĐ: {selectedPayment.invoiceNo || "—"}
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
                                    <p className="text-slate-400">Phương thức</p>
                                    <p className={`text-lg font-semibold ${methodColors[selectedPayment.method] || methodColors.OTHER}`}>
                                        {translateStatus(selectedPayment.method, 'payment')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Số tiền</p>
                                    <p className="text-2xl font-bold text-emerald-400">
                                        {selectedPayment.amount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Khách hàng</p>
                                    <p className="text-white">{selectedPayment.customerName || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Booking</p>
                                    <p className="text-white">{selectedPayment.bookingCode || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Xe</p>
                                    <p className="text-white">{selectedPayment.vehicleName || "—"}</p>
                                    <p className="text-slate-400">{selectedPayment.licensePlate || "—"}</p>
                                </div>

                                <div>
                                    <p className="text-slate-400">Chi nhánh</p>
                                    <p className="text-white">{selectedPayment.branchName || "—"}</p>
                                </div>

                                {selectedPayment.paidAt && (
                                    <div>
                                        <p className="text-slate-400">Ngày thanh toán</p>
                                        <p className="text-white">
                                            {new Date(selectedPayment.paidAt).toLocaleDateString("vi-VN")} {new Date(selectedPayment.paidAt).toLocaleTimeString("vi-VN")}
                                        </p>
                                    </div>
                                )}

                                {selectedPayment.referenceNo && (
                                    <div>
                                        <p className="text-slate-400">Mã tham chiếu</p>
                                        <p className="text-white">{selectedPayment.referenceNo}</p>
                                    </div>
                                )}

                                {selectedPayment.note && (
                                    <div>
                                        <p className="text-slate-400">Ghi chú</p>
                                        <p className="text-white">{selectedPayment.note}</p>
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

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { billingService } from "@/services/billing.service";
import { translateStatus } from "@/lib/utils";
import InvoiceModal from "./_components/InvoiceModal";

function InvoicesContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const searchParams = useSearchParams();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [invoices, setInvoices] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

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

        async function loadInvoices() {
            try {
                setLoading(true);
                const res = await billingService.invoicesByBranch(employee.branchId);

                const items = Array.isArray(res?.items) ? res.items : [];
                const totalCount = res?.total ?? items.length;

                setInvoices(items);
                setTotal(totalCount);
            } catch (e) {
                console.error("Load invoices failed", e);
                setError("Không thể tải danh sách hóa đơn");
            } finally {
                setLoading(false);
            }
        }

        loadInvoices();
    }, [employee?.branchId]);

    useEffect(() => {
        const invoiceId = searchParams.get("invoiceId");
        if (invoiceId && invoices.length > 0) {
            const invoice = invoices.find((i) => i.id === invoiceId);
            if (invoice) {
                setSelectedInvoice(invoice);
                window.history.replaceState({}, "", "/employee/invoices");
            }
        }
    }, [invoices, searchParams]);

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-2">
                Danh sách hóa đơn
            </h1>
            <p className="mb-4 text-sm text-slate-400">
                Chi nhánh:{" "}
                <span className="text-blue-400">
                    {employee?.branch?.name || employee?.branchId || "—"}
                </span>{" "}
                • Tổng: {total}
            </p>

            {loading ? (
                <p>Đang tải danh sách hóa đơn...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : invoices.length === 0 ? (
                <p className="text-gray-400">Không có hóa đơn nào.</p>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Mã HĐ</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Booking</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Khách hàng</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Xe</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Tổng tiền</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-300 uppercase">Đã thanh toán</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Ngày tạo</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300 uppercase">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => {
                                    const paymentsTotal = inv.payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;
                                    const remaining = inv.totalAmount - paymentsTotal;
                                    return (
                                        <tr
                                            key={inv.id}
                                            className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                            onClick={() => setSelectedInvoice(inv)}
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-100">{inv.invoiceNo || "—"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-200">{inv.booking?.bookingCode || "—"}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-200">{inv.booking?.customer?.fullName || inv.customer?.fullName || "—"}</p>
                                                <p className="text-xs text-slate-400">{inv.booking?.customer?.phone || inv.customer?.phone || ""}</p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-200">{inv.booking?.vehicle?.name || "—"}</p>
                                                <p className="text-xs text-slate-400">{inv.booking?.vehicle?.licensePlate || ""}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="font-semibold text-emerald-400">
                                                    {inv.totalAmount?.toLocaleString("vi-VN")} đ
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <p className="text-blue-400">
                                                    {paymentsTotal.toLocaleString("vi-VN")} đ
                                                </p>
                                                {remaining > 0 && (
                                                    <p className="text-xs text-red-400">
                                                        Còn: {remaining.toLocaleString("vi-VN")} đ
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    inv.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                                    inv.status === "UNPAID" ? "bg-red-500/20 text-red-400" :
                                                    "bg-slate-500/20 text-slate-400"
                                                }`}>
                                                    {translateStatus(inv.status, 'invoice')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-slate-400 text-xs">
                                                    {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("vi-VN", {
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
                                                        setSelectedInvoice(inv);
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

                    {selectedInvoice && (
                        <InvoiceModal
                            invoice={selectedInvoice}
                            onClose={() => setSelectedInvoice(null)}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function InvoicesPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <InvoicesContent />
        </Suspense>
    );
}

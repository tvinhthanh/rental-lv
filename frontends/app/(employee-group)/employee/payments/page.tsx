"use client";

import { useEffect, useState, Suspense } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { billingService } from "@/services/billing.service";
import PaymentCard from "./_components/PaymentCard";
import PaymentModal from "./_components/PaymentModal";

function PaymentsContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [payments, setPayments] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [invoices, setInvoices] = useState<any[]>([]);

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

        async function loadPayments() {
            try {
                setLoading(true);
                const res = await billingService.invoicesByBranch(employee.branchId);

                const invoicesList = Array.isArray(res?.items) ? res.items : [];
                setInvoices(invoicesList);
                const allPayments: any[] = [];

                // Lấy tất cả payments từ các invoices
                for (const invoice of invoicesList) {
                    if (invoice.payments && Array.isArray(invoice.payments)) {
                        for (const payment of invoice.payments) {
                            allPayments.push({
                                ...payment,
                                invoiceNo: invoice.invoiceNo,
                                invoiceId: invoice.id,
                                invoice: invoice, // Lưu cả invoice để mở modal
                                bookingCode: invoice.booking?.bookingCode,
                                customerName: invoice.booking?.customer?.fullName || invoice.customer?.fullName,
                                vehicleName: invoice.booking?.vehicle?.name,
                                licensePlate: invoice.booking?.vehicle?.licensePlate,
                                totalAmount: invoice.totalAmount
                            });
                        }
                    }
                }

                // Sắp xếp theo ngày tạo mới nhất
                allPayments.sort((a, b) => {
                    const dateA = new Date(a.paidAt || a.createdAt).getTime();
                    const dateB = new Date(b.paidAt || b.createdAt).getTime();
                    return dateB - dateA;
                });

                setPayments(allPayments);
                setTotal(allPayments.length);
            } catch (e) {
                console.error("Load payments failed", e);
                setError("Không thể tải danh sách thanh toán");
            } finally {
                setLoading(false);
            }
        }

                loadPayments();
    }, [employee?.branchId]);

    // Refresh payments khi component mount lại (sau khi tạo payment mới)
    useEffect(() => {
        if (employee?.branchId) {
            async function refreshPayments() {
                try {
                    const res = await billingService.invoicesByBranch(employee.branchId);
                    const invoices = Array.isArray(res?.items) ? res.items : [];
                    const allPayments: any[] = [];

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
                                    totalAmount: invoice.totalAmount
                                });
                            }
                        }
                    }

                    allPayments.sort((a, b) => {
                        const dateA = new Date(a.paidAt || a.createdAt).getTime();
                        const dateB = new Date(b.paidAt || b.createdAt).getTime();
                        return dateB - dateA;
                    });

                    setPayments(allPayments);
                    setTotal(allPayments.length);
                } catch (e) {
                    console.error("Refresh payments failed", e);
                }
            }
            refreshPayments();
        }
    }, []);

    return (
        <div className="min-h-screen text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Bàn Thanh Toán
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Chi nhánh:{" "}
                            <span className="text-blue-400">
                                {employee?.branch?.name || employee?.branchId || "—"}
                            </span>
                            {" • "}Hiển thị dạng thẻ game.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng thanh toán</p>
                        <p className="text-lg font-semibold text-emerald-400">
                            {total.toLocaleString("vi-VN")}
                        </p>
                    </div>
                </div>

                {/* Body */}
                {loading ? (
                    <div className="mt-10 flex justify-center">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    </div>
                ) : error ? (
                    <div className="mt-10 rounded-2xl border border-red-700 bg-red-900/20 py-12 text-center">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="mt-10 rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Hiện chưa có thanh toán nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {payments.map((p, idx) => (
                            <PaymentCard
                                key={p.id || idx}
                                payment={p}
                                onClick={() => {
                                    setSelectedPayment(p);
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Detail Modal */}
            {selectedPayment && (
                <PaymentModal
                    payment={selectedPayment}
                    onClose={() => setSelectedPayment(null)}
                />
            )}
        </div>
    );
}

export default function PaymentsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <PaymentsContent />
        </Suspense>
    );
}

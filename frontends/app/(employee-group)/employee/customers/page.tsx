"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { bookingService } from "@/services/booking.service";
import CustomerCard from "./_components/CustomerCard";

export default function EmployeeCustomersPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [loadingEmployee, setLoadingEmployee] = useState(true);
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load employee
    useEffect(() => {
        if (userLoading) return;

        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            return;
        }

        async function loadEmployee() {
            try {
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (err) {
                console.error("Load employee failed:", err);
                setError("Không thể tải thông tin nhân viên");
            } finally {
                setLoadingEmployee(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    // Load customers (unique from bookings)
    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadCustomers() {
            try {
                setLoadingCustomers(true);

                const res = await bookingService.getByBranch(employee.branchId);
                const bookings = res?.items || res?.data?.items || [];

                // Lấy unique khách hàng
                const map = new Map();

                bookings.forEach((b: any) => {
                    if (b.customer) {
                        const existing = map.get(b.customer.id);

                        if (!existing) {
                            map.set(b.customer.id, {
                                ...b.customer,
                                bookingCount: 1,
                                lastBookingDate: b.createdAt,
                                totalSpent: b.totalAmount || 0,
                            });
                        } else {
                            existing.bookingCount++;
                            existing.totalSpent = (existing.totalSpent || 0) + (b.totalAmount || 0);
                            // update last booking date if newer
                            if (new Date(b.createdAt) > new Date(existing.lastBookingDate)) {
                                existing.lastBookingDate = b.createdAt;
                            }
                        }
                    }
                });

                // Sort by last booking date (newest first)
                const customersList = Array.from(map.values()).sort((a: any, b: any) => {
                    return new Date(b.lastBookingDate).getTime() - new Date(a.lastBookingDate).getTime();
                });

                setCustomers(customersList);
            } catch (err) {
                console.error("Load customers failed:", err);
                setError("Không thể tải danh sách khách hàng");
            } finally {
                setLoadingCustomers(false);
            }
        }

        loadCustomers();
    }, [employee?.branchId]);

    // Guards
    if (userLoading || loadingEmployee) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
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
                <p className="text-yellow-400">Bạn chưa được phân chi nhánh.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Khách Hàng
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Chi nhánh: <span className="text-purple-400">{employee.branch?.name || employee.branchId}</span>
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng khách hàng</p>
                        <p className="text-lg font-semibold text-purple-400">
                            {customers.length}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Customers Grid */}
                {loadingCustomers ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                    </div>
                ) : customers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <p className="text-slate-400">Chưa có khách hàng nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {customers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onClick={() => {
                                    // Có thể mở modal hoặc navigate đến trang chi tiết
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

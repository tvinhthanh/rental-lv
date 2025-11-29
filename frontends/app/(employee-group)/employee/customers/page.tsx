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
    if (userLoading || loadingEmployee)
        return <p className="p-6 text-gray-200">Đang tải...</p>;

    if (!user || user.role !== "EMPLOYEE")
        return <p className="p-6 text-red-400">Bạn không có quyền truy cập.</p>;

    if (!employee)
        return <p className="p-6 text-red-400">Không tìm thấy thông tin nhân viên.</p>;

    if (!employee.branchId)
        return <p className="p-6 text-yellow-300">Bạn chưa được phân chi nhánh.</p>;

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Khách hàng từng booking tại chi nhánh{" "}
                <span className="text-blue-400">{employee.branch?.name}</span>
            </h1>

            {loadingCustomers ? (
                <p className="text-gray-400">Đang tải danh sách khách hàng...</p>
            ) : customers.length === 0 ? (
                <p className="text-gray-400">Chưa có khách hàng nào.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customers.map((c) => (
                        <div
                            key={c.id}
                            className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow"
                        >
                            <div className="flex items-center gap-3">
                                <img
                                    src={c.avatarUrl || "/avatar-default.png"}
                                    className="w-12 h-12 rounded-full border border-slate-600"
                                    alt=""
                                />
                                <div>
                                    <h3 className="text-white font-semibold">{c.fullName}</h3>
                                    <p className="text-gray-400 text-sm">{c.email}</p>
                                </div>
                            </div>

                            <p className="text-gray-300 mt-3">
                                <b>Số lần đặt xe:</b> {c.bookingCount}
                            </p>

                            <p className="text-gray-300">
                                <b>Lần cuối:</b>{" "}
                                {new Date(c.lastBookingDate).toLocaleString("vi-VN")}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

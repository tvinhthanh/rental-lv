"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/BookingCard";

export default function EmployeeBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);

    // Load employee
    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") return;

        async function loadEmployee() {
            setLoadingEmployee(true);

            const res = await employeeService.getUser(user.id);
            const data = res?.data || res;

            console.log("EMPLOYEE:", data);

            setEmployee(data);
            setLoadingEmployee(false);
        }

        loadEmployee();
    }, [user, userLoading]);

    // Load bookings by branch
    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadBookings() {
            setLoadingBookings(true);

            const res = await bookingService.getByBranch(employee.branchId);

            console.log("BOOKINGS RAW:", res);

            // FIX PARSER — vì API trả array thẳng
            const items = Array.isArray(res)
                ? res
                : res?.data || res?.items || [];

            console.log("BOOKINGS PARSED:", items);

            setBookings([...items]);
            setLoadingBookings(false);
        }

        loadBookings();
    }, [employee?.branchId]);

    if (userLoading || loadingEmployee) return <p>Đang tải...</p>;

    if (!user || user.role !== "EMPLOYEE") return <p>Không có quyền</p>;

    if (!employee) return <p>Không tìm thấy employee</p>;

    if (!employee.branchId) return <p>Bạn chưa được phân chi nhánh</p>;
    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Booking tại chi nhánh:{" "}
                <span className="text-blue-400">
                    {employee.branchId}
                </span>
            </h1>

            {loadingBookings ? (
                <p>Đang tải booking...</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                    ))}
                </div>
            )}
        </div>
    );
}

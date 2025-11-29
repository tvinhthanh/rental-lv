"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/BookingCard";
import BookingModal from "./_components/BookingModal";
import { useRouter } from "next/navigation";

export default function EmployeeBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const router = useRouter();

    const [employee, setEmployee] = useState<any>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [bookings, setBookings] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // NEW: Modal state
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [openModal, setOpenModal] = useState(false);

    function handleOpenModal(booking: any) {
        setSelectedBooking(booking);
        setOpenModal(true);
    }

    function handleCloseModal() {
        setOpenModal(false);
        setSelectedBooking(null);
    }

    // Load employee
    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            return;
        }

        async function loadEmployee() {
            try {
                setLoadingEmployee(true);

                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);

            } catch (err) {
                console.error("Load employee failed:", err);
                setError("Không thể tải dữ liệu nhân viên");
            } finally {
                setLoadingEmployee(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    // Load bookings
    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadBookings() {
            try {
                setLoadingBookings(true);

                const res = await bookingService.getByBranch(employee.branchId);

                let items = [];
                let totalCount = 0;

                if (Array.isArray(res?.items)) {
                    items = res.items;
                    totalCount = res.total ?? res.items.length;
                }

                setBookings(items);
                setTotal(totalCount);

            } catch (err) {
                console.error("Load bookings failed:", err);
                setError("Không thể tải danh sách booking");
            } finally {
                setLoadingBookings(false);
            }
        }

        loadBookings();
    }, [employee?.branchId]);

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Booking tại chi nhánh:{" "}
                <span className="text-blue-400">{employee?.branch?.name || employee?.branchId}</span>
            </h1>

            {loadingBookings ? (
                <p>Đang tải booking...</p>
            ) : bookings.length === 0 ? (
                <p className="text-gray-400">Không có booking.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map((b) => (
                        <BookingCard
                            key={b.id}
                            booking={b}
                            onClick={() => handleOpenModal(b)}
                        />
                    ))}
                </div>
            )}

            {openModal && (
                <BookingModal
                    booking={selectedBooking}
                    onClose={handleCloseModal}
                    onCreateContract={() => {
                        router.push(`/employee/contracts/create?bookingId=${selectedBooking.id}`);
                    }}
                />
            )}
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { bookingService } from "@/services/booking.service";
import BookingCard from "./_components/BookingCard";
<<<<<<< HEAD

export default function EmployeeBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
=======
import BookingModal from "./_components/BookingModal";
import { useRouter } from "next/navigation";

export default function EmployeeBookingsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const router = useRouter();
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc

    const [employee, setEmployee] = useState<any>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [bookings, setBookings] = useState<any[]>([]);
<<<<<<< HEAD
    const [loadingBookings, setLoadingBookings] = useState(true);
=======
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
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc

    // Load employee
    useEffect(() => {
        if (userLoading) return;
<<<<<<< HEAD
        if (!user || user.role !== "EMPLOYEE") return;

        async function loadEmployee() {
            setLoadingEmployee(true);

            const res = await employeeService.getUser(user.id);
            const data = res?.data || res;

            console.log("EMPLOYEE:", data);

            setEmployee(data);
            setLoadingEmployee(false);
=======
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
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
        }

        loadEmployee();
    }, [user, userLoading]);

<<<<<<< HEAD
    // Load bookings by branch
=======
    // Load bookings
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadBookings() {
<<<<<<< HEAD
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
=======
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
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
        }

        loadBookings();
    }, [employee?.branchId]);

<<<<<<< HEAD
    if (userLoading || loadingEmployee) return <p>Đang tải...</p>;

    if (!user || user.role !== "EMPLOYEE") return <p>Không có quyền</p>;

    if (!employee) return <p>Không tìm thấy employee</p>;

    if (!employee.branchId) return <p>Bạn chưa được phân chi nhánh</p>;
=======
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Booking tại chi nhánh:{" "}
<<<<<<< HEAD
                <span className="text-blue-400">
                    {employee.branchId}
                </span>
=======
                <span className="text-blue-400">{employee?.branch?.name || employee?.branchId}</span>
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
            </h1>

            {loadingBookings ? (
                <p>Đang tải booking...</p>
<<<<<<< HEAD
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookings.map((b) => (
                        <BookingCard key={b.id} booking={b} />
                    ))}
                </div>
            )}
=======
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
>>>>>>> b98923e812aa745ef2545d907b4ade76db431cbc
        </div>
    );
}

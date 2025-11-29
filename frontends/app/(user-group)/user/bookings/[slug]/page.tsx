"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { vehicleService } from "@/services/vehicle.service";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";

export default function BookingPage() {
    const router = useRouter();
    const { slug } = useParams();
    const { customer, loading: customerLoading } = useCustomer();
    const { formatVND } = useFormatVND();

    const [vehicle, setVehicle] = useState<any>(null);
    const [unavailableRanges, setUnavailableRanges] = useState<any[]>([]);
    const [disabledDates, setDisabledDates] = useState<string[]>([]);

    const todayStr = new Date().toISOString().split("T")[0];

    // DEFAULT START DATE = TOMORROW
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultStart = tomorrow.toISOString().split("T")[0];

    const [startDate, setStartDate] = useState(defaultStart);
    const [endDate, setEndDate] = useState("");

    // ------------------------------------------------------------------
    // LOAD VEHICLE + DATE AVAILABLE
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!slug) return;

        (async () => {
            try {
                // Load vehicle
                const res = await vehicleService.getBySlug(slug as string);
                const data = res?.data || res?.items?.[0] || res;
                if (!data) return notFound();
                setVehicle(data);

                // Load unavailable dates
                const raw = await bookingService.getDateAvailable(data.id);
                const avai = raw?.data || raw || {};

                setUnavailableRanges(avai.unavailableRanges ?? []);
                setDisabledDates(avai.dates ?? []);
            } catch (err) {
                console.error("Error loading booking info:", err);
            }
        })();
    }, [slug]);

    // ------------------------------------------------------------------
    // GLOBAL LOADING STATE
    // ------------------------------------------------------------------
    if (customerLoading || !vehicle) {
        return <div className="p-10 text-gray-400">Đang tải dữ liệu...</div>;
    }

    // ------------------------------------------------------------------
    // PERMISSION CHECK
    // ------------------------------------------------------------------
    if (!customer) {
        return (
            <div className="p-10 text-red-400">
                Bạn chưa có hồ sơ khách hàng. <br />
                Vui lòng cập nhật thông tin trước khi đặt xe.
            </div>
        );
    }

    // ------------------------------------------------------------------
    // DATE UTILITIES
    // ------------------------------------------------------------------
    const isDisabled = (dateStr: string) => disabledDates.includes(dateStr);

    const handleStartDate = (v: string) => {
        if (isDisabled(v)) {
            alert("Ngày này đã có người đặt xe!");
            return;
        }

        setStartDate(v);

        // Reset end date nếu nó invalid
        if (endDate && new Date(endDate) <= new Date(v)) {
            setEndDate("");
        }
    };

    const handleEndDate = (v: string) => {
        if (isDisabled(v)) {
            alert("Ngày này đã có người đặt xe!");
            return;
        }

        if (new Date(v) <= new Date(startDate)) {
            alert("Ngày trả phải lớn hơn ngày bắt đầu!");
            return;
        }

        setEndDate(v);
    };

    // ------------------------------------------------------------------
    // PRICE CALC
    // ------------------------------------------------------------------
    const calculateAmount = () => {
        if (!startDate || !endDate) return 0;

        const diff =
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            86400000;

        return Math.ceil(diff) * (vehicle?.priceList?.dailyRate || 0);
    };

    const totalAmount = calculateAmount();

    // ------------------------------------------------------------------
    // SUBMIT BOOKING
    // ------------------------------------------------------------------
    const handleBooking = async () => {
        if (!startDate || !endDate) {
            return alert("Vui lòng chọn ngày hợp lệ.");
        }

        // Kiểm tra lại range trước submit
        const conflict = disabledDates.some(
            (d) =>
                new Date(d) >= new Date(startDate) &&
                new Date(d) <= new Date(endDate)
        );

        if (conflict) {
            alert("Khoảng ngày bạn chọn đã có người đặt xe.");
            return;
        }

        try {
            const payload = {
                customerId: customer.id,
                vehicleId: vehicle.id,
                branchId: vehicle.branchId,
                returnBranchId: vehicle.branchId,
                pickupDate: startDate,
                returnDate: endDate,
                baseAmount: totalAmount,
                discountAmount: 0,
                note: "",
            };

            const res = await bookingService.create(payload);

            alert("Đặt xe thành công!");
            router.push(`/user/bookings/${res.id}`);
        } catch (err: any) {
            alert(err?.response?.data?.message || "Lỗi đặt xe!");
        }
    };

    // ------------------------------------------------------------------
    // UI
    // ------------------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto p-6 text-gray-200">
            <h1 className="text-3xl font-bold mb-6">Đặt xe: {vehicle.name}</h1>

            {/* VEHICLE CARD */}
            <div className="bg-gray-800/40 p-4 rounded-xl mb-8">
                <img
                    src={vehicle.photos?.[0] || "/no-image.png"}
                    className="w-full h-60 object-cover rounded-lg mb-4"
                    alt={vehicle.name}
                />

                <p className="font-semibold text-xl">
                    Giá thuê:{" "}
                    <span className="text-blue-400">
                        {formatVND(vehicle.priceList?.dailyRate)} / ngày
                    </span>
                </p>

                <p className="text-sm mt-2 text-gray-400">
                    {vehicle.category?.name} • {vehicle.branch?.name}
                </p>
            </div>

            {/* FORM */}
            <div className="bg-gray-800/40 p-6 rounded-xl">
                <h2 className="text-xl font-semibold mb-4">Thông tin đặt xe</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Start Date */}
                    <div>
                        <label className="font-medium">Ngày bắt đầu</label>
                        <input
                            type="date"
                            min={defaultStart} // mặc định ít nhất ngày mai
                            value={startDate}
                            onChange={(e) => handleStartDate(e.target.value)}
                            className="mt-1 w-full p-2 rounded bg-gray-900 border border-gray-700"
                        />
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="font-medium">Ngày trả</label>
                        <input
                            type="date"
                            min={startDate}
                            value={endDate}
                            onChange={(e) => handleEndDate(e.target.value)}
                            className="mt-1 w-full p-2 rounded bg-gray-900 border border-gray-700"
                        />
                    </div>
                </div>

                <div className="text-lg font-semibold mb-6">
                    Tổng tiền:{" "}
                    <span className="text-blue-400">
                        {totalAmount > 0 ? formatVND(totalAmount) : "—"}
                    </span>
                </div>

                <button
                    onClick={handleBooking}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
                >
                    Xác nhận đặt xe
                </button>
            </div>
        </div>
    );
}

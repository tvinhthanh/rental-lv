"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { vehicleService } from "@/services/vehicle.service";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";
import { getPlaceholderImage } from "@/lib/image-placeholder";

export default function BookingPage() {
    const router = useRouter();
    const { slug } = useParams();
    const { customer, loading: customerLoading } = useCustomer();
    const { formatVND } = useFormatVND();

    const [vehicle, setVehicle] = useState<any>(null);
    const [unavailableRanges, setUnavailableRanges] = useState<any[]>([]);
    const [disabledDates, setDisabledDates] = useState<string[]>([]);

    // DEFAULT START DATE = TOMORROW
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0); // Reset time to start of day

    const [startDate, setStartDate] = useState<Date | null>(tomorrow);
    const [endDate, setEndDate] = useState<Date | null>(null);

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

                // ⚡ Load unavailable dates từ database
                const raw = await bookingService.getDateAvailable(data.id);
                const avai = raw?.data || raw || {};

                // ⚡ Set unavailable ranges và dates để chặn user chọn
                const dates = avai.dates ?? [];
                const ranges = avai.unavailableRanges ?? [];
                
                console.log("Unavailable dates:", dates);
                console.log("Unavailable ranges:", ranges);
                
                setUnavailableRanges(ranges);
                setDisabledDates(dates);
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
    // ⚡ Function để check xem một ngày có bị disable không
    const isDateDisabled = (date: Date) => {
        const dateStr = date.toISOString().split("T")[0];
        return disabledDates.includes(dateStr);
    };

    // ⚡ Function để filter dates trong DatePicker
    const filterDate = (date: Date) => {
        // Không cho chọn ngày trong quá khứ (trừ hôm nay)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
            return false;
        }
        
        // Không cho chọn các ngày đã được đặt
        return !isDateDisabled(date);
    };

    const handleStartDateChange = (date: Date | null) => {
        if (!date) return;
        
        setStartDate(date);
        
        // Reset end date nếu nó invalid
        if (endDate && endDate <= date) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (!date) return;
        
        if (startDate && date <= startDate) {
            alert("Ngày trả phải lớn hơn ngày bắt đầu!");
            return;
        }
        
        setEndDate(date);
    };

    // ------------------------------------------------------------------
    // PRICE CALC
    // ------------------------------------------------------------------
    const calculateAmount = () => {
        if (!startDate || !endDate) return 0;

        const diff =
            (endDate.getTime() - startDate.getTime()) /
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

        // Kiểm tra xem có ngày nào trong range bị disabled không
        const hasConflict = disabledDates.some(dateStr => {
            if (!startDate || !endDate) return false;
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            return date >= startDate && date <= endDate;
        });

        if (hasConflict) {
            alert("Khoảng ngày bạn chọn có ngày đã được đặt. Vui lòng chọn lại.");
            return;
        }

        try {
            const payload = {
                customerId: customer.id,
                vehicleId: vehicle.id,
                branchId: vehicle.branchId,
                returnBranchId: vehicle.branchId,
                pickupDate: startDate.toISOString().split("T")[0],
                returnDate: endDate.toISOString().split("T")[0],
                baseAmount: totalAmount,
                discountAmount: 0,
                note: "",
            };

            const res = await bookingService.create(payload);
            
            // ⚡ Kiểm tra response có hợp lệ không
            if (!res || !res.id) {
                console.error("Invalid booking response:", res);
                throw new Error("Không nhận được thông tin booking từ server");
            }

            alert("Đặt xe thành công!");
            router.push(`/user/bookings/${res.id}`);
        } catch (err: any) {
            console.error("Booking error:", err);
            const errorMsg = err?.response?.data?.message || err?.message || "Lỗi đặt xe!";
            alert(errorMsg);
        }
    };

    // ------------------------------------------------------------------
    // UI
    // ------------------------------------------------------------------
    return (
        <div className="max-w-4xl mx-auto p-6 text-gray-200">
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Đặt xe: {vehicle.name}</h1>

            {/* VEHICLE CARD */}
            <div className="bg-gray-800/40 p-4 rounded-xl mb-8">
                <img
                    src={vehicle.photos?.[0] || getPlaceholderImage(400, 300)}
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
                        <label className="font-medium block mb-2">Ngày bắt đầu</label>
                        <DatePicker
                            selected={startDate}
                            onChange={handleStartDateChange}
                            filterDate={filterDate}
                            minDate={tomorrow}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày bắt đầu"
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white"
                            wrapperClassName="w-full"
                            calendarClassName="bg-gray-800 border-gray-700"
                            dayClassName={(date) => {
                                if (isDateDisabled(date)) {
                                    return "text-gray-500 cursor-not-allowed";
                                }
                                return "";
                            }}
                        />
                        {disabledDates.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                {disabledDates.length} ngày đã được đặt (không thể chọn)
                            </p>
                        )}
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="font-medium block mb-2">Ngày trả</label>
                        <DatePicker
                            selected={endDate}
                            onChange={handleEndDateChange}
                            filterDate={filterDate}
                            minDate={startDate || tomorrow}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Chọn ngày trả"
                            disabled={!startDate}
                            className="w-full p-2 rounded bg-gray-900 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            wrapperClassName="w-full"
                            calendarClassName="bg-gray-800 border-gray-700"
                            dayClassName={(date) => {
                                if (isDateDisabled(date)) {
                                    return "text-gray-500 cursor-not-allowed";
                                }
                                if (startDate && date <= startDate) {
                                    return "text-gray-500 cursor-not-allowed";
                                }
                                return "";
                            }}
                        />
                        {!startDate && (
                            <p className="text-xs text-gray-400 mt-1">
                                Vui lòng chọn ngày bắt đầu trước
                            </p>
                        )}
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

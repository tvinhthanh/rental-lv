"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Custom styles for disabled dates (rented dates)
const customDatePickerStyles = `
    .react-datepicker__day.disabled-date-gray {
        background-color: #4b5563 !important;
        color: #9ca3af !important;
        opacity: 0.5 !important;
        cursor: not-allowed !important;
        text-decoration: line-through !important;
    }
    .react-datepicker__day.disabled-date-gray:hover {
        background-color: #4b5563 !important;
        color: #9ca3af !important;
    }
    .react-datepicker__day--disabled {
        background-color: #374151 !important;
        color: #6b7280 !important;
        opacity: 0.4 !important;
        cursor: not-allowed !important;
    }
`;
import { vehicleService } from "@/services/vehicle.service";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";
import { getPlaceholderImage } from "@/lib/image-placeholder";
import { promotionService } from "@/services/promotion.service";

const isPromotionActive = (promo?: any) => {
    if (!promo) return false;
    if (promo.status && promo.status !== "ACTIVE") return false;
    const now = new Date();
    if (promo.startDate) {
        const start = new Date(promo.startDate);
        start.setHours(0, 0, 0, 0);
        if (start > now) return false;
    }
    if (promo.endDate) {
        const end = new Date(promo.endDate);
        end.setHours(23, 59, 59, 999);
        if (end < now) return false;
    }
    const used = Number(promo.usedCount || 0);
    if (promo.usageLimit && used >= promo.usageLimit) return false;
    return true;
};

const calculateDiscount = (baseAmount: number, promo: any) => {
    if (!promo || !baseAmount) return 0;
    const percent = promo.discountPercent != null ? Number(promo.discountPercent) : null;
    const amount = promo.discountAmount != null ? Number(promo.discountAmount) : null;
    const raw = percent != null ? (baseAmount * percent) / 100 : amount || 0;
    const clean = Math.round(raw);
    return Math.max(0, Math.min(clean, baseAmount));
};

export default function BookingPage() {
    const router = useRouter();
    const { slug } = useParams();
    const { customer, loading: customerLoading } = useCustomer();
    const { formatVND } = useFormatVND();

    const [vehicle, setVehicle] = useState<any>(null);
    const [unavailableRanges, setUnavailableRanges] = useState<any[]>([]);
    const [disabledDates, setDisabledDates] = useState<string[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [selectedPromotion, setSelectedPromotion] = useState<any | null>(null);
    const [promoCode, setPromoCode] = useState("");
    const [promoNote, setPromoNote] = useState<string | null>(null);
    const [promoLoading, setPromoLoading] = useState(false);
    const [dateError, setDateError] = useState<string | null>(null);

    const todayStr = new Date().toISOString().split("T")[0];

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
                
                setUnavailableRanges(ranges);
                setDisabledDates(dates);
            } catch (err) {
                console.error("Error loading booking info:", err);
            }
        })();
    }, [slug]);

    useEffect(() => {
        // load active promotions for user to pick
        setPromoLoading(true);
        promotionService
            .list({ active: "true", limit: 50 })
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                const activeItems = items.filter((p: any) => isPromotionActive(p));
                setPromotions(activeItems);
            })
            .catch((err) => {
                console.error("Load promotions failed:", err);
                setPromoNote("Không thể tải khuyến mãi, vui lòng thử lại sau.");
            })
            .finally(() => setPromoLoading(false));
    }, []);

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
        setDateError(null);
        
        // Reset end date nếu nó invalid
        if (endDate && endDate <= date) {
            setEndDate(null);
        }
    };

    const handleEndDateChange = (date: Date | null) => {
        if (!date) return;
        
        if (startDate && date <= startDate) {
            setDateError("Ngày trả phải lớn hơn ngày bắt đầu");
            return;
        }
        setDateError(null);
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
    const promoDiscount = selectedPromotion ? calculateDiscount(totalAmount, selectedPromotion) : 0;
    const finalAmount = Math.max(totalAmount - promoDiscount, 0);

    const handleApplyPromotion = async () => {
        const code = promoCode.trim();
        if (!code) {
            setPromoNote("Vui lòng nhập mã khuyến mãi.");
            return;
        }
        setPromoNote(null);
        setPromoLoading(true);

        try {
            const local = promotions.find((p) => p.code?.toLowerCase() === code.toLowerCase());
            if (local && isPromotionActive(local)) {
                setSelectedPromotion(local);
                return;
            }

            const res = await promotionService.list({ code, limit: 1 });
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            const found = items.find((p:any) => isPromotionActive(p));

            if (found) {
                setSelectedPromotion(found);
                setPromotions((prev) => {
                    const exists = prev.some((p) => p.id === found.id);
                    return exists ? prev : [...prev, found];
                });
            } else {
                setSelectedPromotion(null);
                setPromoNote("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
            }
        } catch (err: any) {
            setSelectedPromotion(null);
            setPromoNote(err?.response?.data?.message || "Không tìm thấy mã khuyến mãi.");
        } finally {
            setPromoLoading(false);
        }
    };

    // ------------------------------------------------------------------
    // VALIDATION
    // ------------------------------------------------------------------
    const hasDateConflict = () => {
        if (!startDate || !endDate) return false;

        // Check disabled dates
        const hasDisabledDate = disabledDates.some(dateStr => {
            const date = new Date(dateStr);
            date.setHours(0, 0, 0, 0);
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });

        if (hasDisabledDate) return true;

        // Check unavailable ranges
        const hasRangeConflict = unavailableRanges.some((range: any) => {
            if (!range.startDate || !range.endDate) return false;
            const rangeStart = new Date(range.startDate);
            rangeStart.setHours(0, 0, 0, 0);
            const rangeEnd = new Date(range.endDate);
            rangeEnd.setHours(23, 59, 59, 999);
            
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            // Check if ranges overlap
            return (start <= rangeEnd && end >= rangeStart);
        });

        return hasRangeConflict;
    };

    // ------------------------------------------------------------------
    // SUBMIT BOOKING
    // ------------------------------------------------------------------
    const handleBooking = async () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (!startDate || !endDate) {
            setDateError("Vui lòng chọn ngày bắt đầu và ngày trả");
            return;
        }
        if (startDate < today) {
            setDateError("Ngày bắt đầu không được ở quá khứ");
            return;
        }
        if (endDate <= startDate) {
            setDateError("Ngày trả phải lớn hơn ngày bắt đầu");
            return;
        }
        if (hasDateConflict()) {
            setDateError("Xe không khả dụng cho khoảng ngày bạn chọn. Vui lòng chọn lại.");
            return;
        }
        setDateError(null);

        try {
            const payload = {
                customerId: customer.id,
                vehicleId: vehicle.id,
                branchId: vehicle.branchId,
                returnBranchId: vehicle.branchId,
                pickupDate: startDate.toISOString().split("T")[0],
                returnDate: endDate.toISOString().split("T")[0],
                baseAmount: totalAmount,
                discountAmount: selectedPromotion ? promoDiscount : 0,
                ...(selectedPromotion
                    ? {
                        promotionId: selectedPromotion.id,
                    }
                    : {}),
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
        <>
            {/* Custom styles for rented dates */}
            <style jsx global>{`
                .react-datepicker__day.rented-date-disabled {
                    background-color: #4b5563 !important;
                    color: #9ca3af !important;
                    opacity: 0.6 !important;
                    cursor: not-allowed !important;
                    text-decoration: line-through !important;
                    position: relative;
                }
                .react-datepicker__day.rented-date-disabled:hover {
                    background-color: #4b5563 !important;
                    color: #9ca3af !important;
                }
                .react-datepicker__day.rented-date-disabled::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    right: 0;
                    height: 1px;
                    background-color: #9ca3af;
                    transform: translateY(-50%);
                }
                .react-datepicker__day--disabled {
                    background-color: #374151 !important;
                    color: #6b7280 !important;
                    opacity: 0.4 !important;
                    cursor: not-allowed !important;
                }
            `}</style>
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
                                    return "rented-date-disabled";
                                }
                                return "";
                            }}
                        />
                        {disabledDates.length > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                                {disabledDates.length} ngày đã được đặt (không thể chọn)
                            </p>
                        )}
                        {dateError && (
                            <p className="text-xs text-rose-400 mt-1">{dateError}</p>
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
                                    return "rented-date-disabled";
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

                <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-4 space-y-3 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                        <div>
                            <p className="text-sm text-gray-300">Mã khuyến mãi (nếu có)</p>
                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                <input
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Nhập mã khuyến mãi"
                                    className="flex-1 p-2 rounded bg-gray-800 border border-gray-700 text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyPromotion}
                                    disabled={promoLoading || !promoCode.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white disabled:opacity-60"
                                >
                                    {promoLoading ? "Đang kiểm tra..." : "Áp dụng"}
                                </button>
                                {selectedPromotion && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedPromotion(null);
                                            setPromoNote(null);
                                        }}
                                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
                                    >
                                        Bỏ chọn
                                    </button>
                                )}
                            </div>
                            {promoNote && <p className="text-sm text-rose-300 mt-1">{promoNote}</p>}
                        </div>
                        {promotions.length > 0 && (
                            <div className="text-sm text-gray-300 bg-gray-800/60 border border-gray-700 rounded-lg p-3 w-full md:w-80">
                                <p className="font-semibold mb-2">Khuyến mãi khả dụng</p>
                                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                                    {promotions.map((p) => (
                                        <button
                                            type="button"
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedPromotion(p);
                                                setPromoCode(p.code || "");
                                                setPromoNote(null);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded border ${selectedPromotion?.id === p.id ? "border-blue-400 bg-blue-500/10 text-white" : "border-gray-700 bg-gray-900/40 text-gray-200"
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">{p.code}</span>
                                                <span className="text-xs text-gray-400">{p.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-300">{p.name}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {selectedPromotion && (
                        <div className="border border-blue-500/40 bg-blue-900/20 rounded-lg p-3 text-sm text-blue-100">
                            <div className="font-semibold text-white flex items-center justify-between gap-2">
                                <span>{selectedPromotion.name}</span>
                                <span className="text-blue-200">{selectedPromotion.code}</span>
                            </div>
                            <p className="mt-1 text-blue-100">{selectedPromotion.description || "Khuyến mãi đang áp dụng"}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-xs text-blue-100">
                                {selectedPromotion.discountPercent != null && (
                                    <span className="px-2 py-1 rounded-full bg-white/10">
                                        Giảm {selectedPromotion.discountPercent}%
                                    </span>
                                )}
                                {selectedPromotion.discountAmount != null && (
                                    <span className="px-2 py-1 rounded-full bg-white/10">
                                        Giảm {formatVND(selectedPromotion.discountAmount)}
                                    </span>
                                )}
                                {selectedPromotion.endDate && (
                                    <span className="px-2 py-1 rounded-full bg-white/10">
                                        Hết hạn: {new Date(selectedPromotion.endDate).toLocaleDateString("vi-VN")}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="text-lg font-semibold">
                        <div className="flex items-center justify-between text-gray-300">
                            <span>Tạm tính</span>
                            <span className="text-blue-400">{totalAmount > 0 ? formatVND(totalAmount) : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-300">
                            <span>Khuyến mãi</span>
                            <span className="text-emerald-300">- {promoDiscount > 0 ? formatVND(promoDiscount) : "0 đ"}</span>
                        </div>
                        <div className="flex items-center justify-between text-white mt-2 text-xl">
                            <span>Thành tiền</span>
                            <span className="text-blue-400 font-bold">{finalAmount > 0 ? formatVND(finalAmount) : "—"}</span>
                        </div>
                    </div>
                </div>

                {/* Warning message if date conflict */}
                {startDate && endDate && hasDateConflict() && (
                    <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-300 text-sm font-semibold">
                            ⚠️ Xe không khả dụng cho khoảng ngày bạn chọn
                        </p>
                        <p className="text-red-400 text-xs mt-1">
                            Vui lòng chọn khoảng ngày khác
                        </p>
                    </div>
                )}

                <button
                    onClick={handleBooking}
                    disabled={!startDate || !endDate || !customer || hasDateConflict()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-600"
                >
                    {hasDateConflict() ? "Xe không khả dụng" : "Xác nhận đặt xe"}
                </button>
            </div>
        </div>
        </>
    );
}

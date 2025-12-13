"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { vehicleService } from "@/services/vehicle.service";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";
import { promotionService } from "@/services/promotion.service";

const isPromotionActive = (promo?: any) => {
    if (!promo) return false;
    if (promo.status && promo.status !== "ACTIVE") return false;
    const now = new Date();
    if (promo.startDate && new Date(promo.startDate) > now) return false;
    if (promo.endDate && new Date(promo.endDate) < now) return false;
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

    useEffect(() => {
        // load active promotions for user to pick
        setPromoLoading(true);
        promotionService
            .list({ active: "true", limit: 50 })
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                const activeItems = items.filter((p) => isPromotionActive(p));
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
            const found = items.find((p) => isPromotionActive(p));

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
                ...(selectedPromotion
                    ? {
                        promotionId: selectedPromotion.id,
                        discountAmount: promoDiscount,
                    }
                    : {}),
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

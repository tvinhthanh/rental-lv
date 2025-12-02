"use client";

import { useState, useEffect, FormEvent } from "react";
import { bookingService } from "@/services/booking.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";

type CreateHandoverModalProps = {
    branchId: string;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreateHandoverModal({ branchId, onClose, onSuccess }: CreateHandoverModalProps) {
    const { data: user } = useCurrentUser();
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string>("");
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [employee, setEmployee] = useState<any | null>(null);

    // Form state
    const [odoStart, setOdoStart] = useState<string>("");
    const [fuelLevelStart, setFuelLevelStart] = useState<string>("");
    const [pickupPlace, setPickupPlace] = useState<string>("");
    const [exteriorStatus, setExteriorStatus] = useState<string>("GOOD");
    const [interiorStatus, setInteriorStatus] = useState<string>("GOOD");
    const [damageNote, setDamageNote] = useState<string>("");
    const [accessories, setAccessories] = useState<string>("");
    const [handedOverBy, setHandedOverBy] = useState<string>("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Load employee
    useEffect(() => {
        if (!user?.id) return;
        async function loadEmployee() {
            try {
                const empRes = await employeeService.getUser(user.id);
                const emp = empRes?.data || empRes;
                setEmployee(emp);
                setHandedOverBy(emp?.fullName || "");
            } catch (e) {
                console.error("Load employee failed", e);
            }
        }
        loadEmployee();
    }, [user]);

    // Load bookings có contract và deposit nhưng chưa có handover
    useEffect(() => {
        async function loadBookings() {
            try {
                setLoadingBookings(true);
                const res = await bookingService.getByBranch(branchId);
                const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
                
                // Lọc bookings có contract và deposit nhưng chưa có handover
                const filtered = items.filter((b: any) => {
                    return b.contract && b.deposit && !b.handover && b.status === "CONTRACTED";
                });
                
                setBookings(filtered);
            } catch (e) {
                console.error("Load bookings failed", e);
            } finally {
                setLoadingBookings(false);
            }
        }
        loadBookings();
    }, [branchId]);

    // Load booking details khi chọn
    useEffect(() => {
        if (!selectedBookingId) {
            setSelectedBooking(null);
            return;
        }

        async function loadBooking() {
            try {
                setLoadingBooking(true);
                const res = await bookingService.get(selectedBookingId);
                const b = res?.data || res;
                setSelectedBooking(b);
            } catch (e) {
                console.error("Load booking failed", e);
            } finally {
                setLoadingBooking(false);
            }
        }

        loadBooking();
    }, [selectedBookingId]);

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};
        if (!selectedBookingId) {
            newErrors.bookingId = "Vui lòng chọn booking";
        }
        if (!odoStart || odoStart.trim() === "") {
            newErrors.odoStart = "Số km đầu là bắt buộc";
        } else {
            const odo = Number(odoStart);
            if (isNaN(odo) || odo < 0) {
                newErrors.odoStart = "Số km phải >= 0";
            }
        }
        if (fuelLevelStart && fuelLevelStart.trim() !== "") {
            const fuel = Number(fuelLevelStart);
            if (isNaN(fuel) || fuel < 0 || fuel > 100) {
                newErrors.fuelLevelStart = "Mức nhiên liệu phải từ 0-100%";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!selectedBookingId) return;

        if (!validateForm()) {
            setError("Vui lòng kiểm tra lại các trường không hợp lệ");
            return;
        }

        setError(null);
        setSuccess(null);
        setSubmitting(true);

        try {
            const payload: any = {
                bookingId: selectedBookingId,
                odoStart: Number(odoStart),
                pickupPlace: pickupPlace || undefined,
                exteriorStatus: exteriorStatus || undefined,
                interiorStatus: interiorStatus || undefined,
                handedOverBy: handedOverBy || undefined,
            };

            if (fuelLevelStart) payload.fuelLevelStart = Number(fuelLevelStart);
            if (damageNote) payload.damageNote = damageNote;
            if (accessories) payload.accessories = accessories;
            if (employee?.id) payload.employeeId = employee.id;

            await rentalProcessService.createHandover(payload);

            setSuccess("Tạo phiếu giao xe thành công");
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (e: any) {
            console.error("Create handover failed", e);
            setError(e?.message || "Tạo phiếu giao xe thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    const contract = selectedBooking?.contract;
    const deposit = selectedBooking?.deposit;

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold text-white">
                        Tạo phiếu giao xe
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                    {/* Chọn Booking */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            Chọn Booking (có Contract và Deposit) <span className="text-red-400">*</span>
                        </label>
                        {loadingBookings ? (
                            <p className="text-sm text-slate-400">Đang tải danh sách booking...</p>
                        ) : bookings.length === 0 ? (
                            <p className="text-sm text-yellow-400">Không có booking nào có contract và deposit, chưa có handover.</p>
                        ) : (
                            <select
                                value={selectedBookingId}
                                onChange={(e) => {
                                    setSelectedBookingId(e.target.value);
                                    if (errors.bookingId) {
                                        setErrors({ ...errors, bookingId: "" });
                                    }
                                }}
                                className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                    errors.bookingId ? "border-red-500" : "border-slate-600"
                                }`}
                            >
                                <option value="">-- Chọn booking --</option>
                                {bookings.map((b: any) => (
                                    <option key={b.id} value={b.id}>
                                        {b.bookingCode} - {b.customer?.fullName} - {b.vehicle?.name} ({b.vehicle?.licensePlate})
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.bookingId && (
                            <p className="mt-1 text-xs text-red-400">{errors.bookingId}</p>
                        )}
                    </div>

                    {/* Thông tin Booking đã chọn */}
                    {selectedBooking && !loadingBooking && (
                        <div className="grid gap-4 md:grid-cols-2 text-sm">
                            {/* Booking Info */}
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                <h3 className="text-sm font-semibold text-blue-300 mb-2">Thông tin Booking</h3>
                                <p><b>Mã:</b> {selectedBooking.bookingCode}</p>
                                <p><b>Khách hàng:</b> {selectedBooking.customer?.fullName}</p>
                                <p><b>Xe:</b> {selectedBooking.vehicle?.name} - {selectedBooking.vehicle?.licensePlate}</p>
                                <p><b>Trạng thái:</b> {selectedBooking.status}</p>
                            </div>

                            {/* Contract Info */}
                            {contract && (
                                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                    <h3 className="text-sm font-semibold text-emerald-300 mb-2">✓ Hợp đồng</h3>
                                    <p><b>Mã:</b> {contract.contractNo}</p>
                                    <p><b>Tổng tiền:</b> {contract.totalAmount?.toLocaleString("vi-VN")} đ</p>
                                    <p><b>Ngày bắt đầu:</b> {contract.startDate ? new Date(contract.startDate).toLocaleDateString("vi-VN") : "—"}</p>
                                    <p><b>Ngày kết thúc:</b> {contract.endDate ? new Date(contract.endDate).toLocaleDateString("vi-VN") : "—"}</p>
                                </div>
                            )}

                            {/* Deposit Info */}
                            {deposit && (
                                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                    <h3 className="text-sm font-semibold text-emerald-300 mb-2">✓ Tiền đặt cọc</h3>
                                    <p><b>Tổng tiền:</b> {deposit.totalAmount?.toLocaleString("vi-VN")} đ</p>
                                    <p><b>Đã sử dụng:</b> {deposit.usedAmount?.toLocaleString("vi-VN") || 0} đ</p>
                                    <p><b>Đã hoàn:</b> {deposit.refundedAmount?.toLocaleString("vi-VN") || 0} đ</p>
                                    <p><b>Trạng thái:</b> {deposit.status}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Form tạo Handover */}
                    {selectedBooking && !loadingBooking && (
                        <div className="border-t border-slate-800 pt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white">Thông tin giao xe</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Số km đầu <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={odoStart}
                                        onChange={(e) => {
                                            setOdoStart(e.target.value);
                                            if (errors.odoStart) {
                                                setErrors({ ...errors, odoStart: "" });
                                            }
                                        }}
                                        min="0"
                                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                            errors.odoStart ? "border-red-500" : "border-slate-600"
                                        }`}
                                    />
                                    {errors.odoStart && (
                                        <p className="mt-1 text-xs text-red-400">{errors.odoStart}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Mức nhiên liệu (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={fuelLevelStart}
                                        onChange={(e) => {
                                            setFuelLevelStart(e.target.value);
                                            if (errors.fuelLevelStart) {
                                                setErrors({ ...errors, fuelLevelStart: "" });
                                            }
                                        }}
                                        min="0"
                                        max="100"
                                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                            errors.fuelLevelStart ? "border-red-500" : "border-slate-600"
                                        }`}
                                    />
                                    {errors.fuelLevelStart && (
                                        <p className="mt-1 text-xs text-red-400">{errors.fuelLevelStart}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Nơi nhận xe</label>
                                <input
                                    type="text"
                                    value={pickupPlace}
                                    onChange={(e) => setPickupPlace(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Tình trạng ngoại thất</label>
                                    <select
                                        value={exteriorStatus}
                                        onChange={(e) => setExteriorStatus(e.target.value)}
                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                    >
                                        <option value="GOOD">Tốt</option>
                                        <option value="FAIR">Khá</option>
                                        <option value="POOR">Kém</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">Tình trạng nội thất</label>
                                    <select
                                        value={interiorStatus}
                                        onChange={(e) => setInteriorStatus(e.target.value)}
                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                    >
                                        <option value="GOOD">Tốt</option>
                                        <option value="FAIR">Khá</option>
                                        <option value="POOR">Kém</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Phụ kiện</label>
                                <input
                                    type="text"
                                    value={accessories}
                                    onChange={(e) => setAccessories(e.target.value)}
                                    placeholder="VD: Chìa khóa, giấy tờ, ..."
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Ghi chú hư hỏng</label>
                                <textarea
                                    value={damageNote}
                                    onChange={(e) => setDamageNote(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Người giao xe</label>
                                <input
                                    type="text"
                                    value={handedOverBy}
                                    onChange={(e) => setHandedOverBy(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                />
                            </div>
                        </div>
                    )}

                    {success && (
                        <p className="text-sm text-emerald-400">{success}</p>
                    )}

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !selectedBookingId || loadingBooking}
                            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white"
                        >
                            {submitting ? "Đang lưu..." : "Lưu phiếu giao xe"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


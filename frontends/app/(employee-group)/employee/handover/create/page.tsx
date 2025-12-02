"use client";

import { useEffect, useState, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";

function CreateHandoverContent() {
    const params = useSearchParams();
    const router = useRouter();
    const { data: user } = useCurrentUser();
    const bookingId = params.get("bookingId") ?? "";

    const [booking, setBooking] = useState<any | null>(null);
    const [employee, setEmployee] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [odoStart, setOdoStart] = useState<string>("");
    const [fuelLevelStart, setFuelLevelStart] = useState<string>("");
    const [pickupPlace, setPickupPlace] = useState<string>("");
    const [exteriorStatus, setExteriorStatus] = useState<string>("GOOD");
    const [interiorStatus, setInteriorStatus] = useState<string>("GOOD");
    const [damageNote, setDamageNote] = useState<string>("");
    const [accessories, setAccessories] = useState<string>("");
    const [handedOverBy, setHandedOverBy] = useState<string>("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!bookingId) {
            setError("Không tìm thấy bookingId");
            setLoading(false);
            return;
        }

        async function loadData() {
            try {
                setLoading(true);
                const [bookingRes, employeeRes] = await Promise.all([
                    bookingService.get(bookingId),
                    user ? employeeService.getUser(user.id) : null
                ]);

                const b = bookingRes?.data || bookingRes;
                setBooking(b);

                if (employeeRes) {
                    const emp = employeeRes?.data || employeeRes;
                    setEmployee(emp);
                    setHandedOverBy(emp.fullName || "");
                }
            } catch (e: any) {
                console.error("Load data failed", e);
                setError("Không thể tải thông tin");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [bookingId, user]);

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

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
        if (!bookingId) return;

        if (!validateForm()) {
            setError("Vui lòng kiểm tra lại các trường không hợp lệ");
            return;
        }

        setError(null);
        setSuccess(null);
        setSubmitting(true);

        try {
            const payload: any = {
                bookingId,
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

            const created = await rentalProcessService.createHandover(payload);

            setSuccess("Tạo phiếu giao xe thành công");

            setTimeout(() => {
                router.push(`/employee/handover?handoverId=${created.id}`);
            }, 1500);
        } catch (e: any) {
            console.error("Create handover failed", e);
            setError(e?.message || "Tạo phiếu giao xe thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-gray-200">
                <p>Đang tải thông tin...</p>
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className="p-6 text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 text-gray-200 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">
                Tạo phiếu giao xe
            </h1>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 mb-6 text-sm space-y-1">
                <p>
                    <b>Mã booking:</b> {booking?.bookingCode} ({bookingId})
                </p>
                <p>
                    <b>Khách hàng:</b> {booking?.customer?.fullName} - {booking?.customer?.phone}
                </p>
                <p>
                    <b>Xe:</b> {booking?.vehicle?.name} - {booking?.vehicle?.licensePlate}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                {success && (
                    <p className="text-sm text-emerald-400">{success}</p>
                )}

                {error && (
                    <p className="text-sm text-red-400">{error}</p>
                )}

                <div className="mt-4 flex gap-3">
                    <button
                        type="submit"
                        disabled={submitting || Object.keys(errors).length > 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded-lg text-sm"
                    >
                        {submitting ? "Đang lưu..." : "Lưu phiếu giao xe"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                    >
                        Quay lại
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function CreateHandoverPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateHandoverContent />
        </Suspense>
    );
}


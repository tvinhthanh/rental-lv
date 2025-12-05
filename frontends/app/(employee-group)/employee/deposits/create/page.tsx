"use client";

import { useEffect, useState, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { depositService } from "@/services/deposit.service";

function CreateDepositContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bookingId = params.get("bookingId") ?? "";

    const [booking, setBooking] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [totalAmount, setTotalAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("CASH");
    const [notes, setNotes] = useState<string>("");

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!bookingId) {
            setError("Không tìm thấy bookingId");
            setLoading(false);
            return;
        }

        async function loadBooking() {
            try {
                setLoading(true);
                const res = await bookingService.get(bookingId);
                const b = res?.data || res;
                setBooking(b);

                // Prefill totalAmount từ booking totalAmount hoặc contract depositAmount
                if (b?.contract?.depositAmount) {
                    setTotalAmount(String(b.contract.depositAmount));
                } else if (b?.totalAmount) {
                    setTotalAmount(String(b.totalAmount * 0.3)); // 30% mặc định
                }
            } catch (e: any) {
                console.error("Load booking failed", e);
                setError("Không thể tải thông tin booking");
            } finally {
                setLoading(false);
            }
        }

        loadBooking();
    }, [bookingId]);

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};

        if (!totalAmount || totalAmount.trim() === "") {
            newErrors.totalAmount = "Tổng tiền đặt cọc là bắt buộc";
        } else {
            const amount = Number(totalAmount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.totalAmount = "Tổng tiền phải lớn hơn 0";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!bookingId || !booking?.customerId) return;

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
                customerId: booking.customerId,
                totalAmount: Number(totalAmount),
                paymentMethod: paymentMethod || "CASH",
                status: "HELD",
            };

            if (notes) payload.notes = notes;

            const created = await depositService.create(payload);

            setSuccess("Tạo tiền đặt cọc thành công");

            setTimeout(() => {
                router.push(`/employee/deposits?depositId=${created.id}`);
            }, 1500);
        } catch (e: any) {
            console.error("Create deposit failed", e);
            setError(e?.message || "Tạo tiền đặt cọc thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="p-6 text-gray-200">
                <p>Đang tải thông tin booking...</p>
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
                Tạo tiền đặt cọc
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
                {booking?.contract?.depositAmount && (
                    <p className="text-blue-400">
                        <b>Tiền đặt cọc trong hợp đồng:</b> {booking.contract.depositAmount.toLocaleString("vi-VN")} đ
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900 border border-slate-700 rounded-xl p-4">
                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Tổng tiền đặt cọc <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="number"
                        value={totalAmount}
                        onChange={(e) => {
                            setTotalAmount(e.target.value);
                            if (errors.totalAmount) {
                                setErrors({ ...errors, totalAmount: "" });
                            }
                        }}
                        min="0"
                        step="1000"
                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                            errors.totalAmount ? "border-red-500" : "border-slate-600"
                        }`}
                    />
                    {errors.totalAmount && (
                        <p className="mt-1 text-xs text-red-400">{errors.totalAmount}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Phương thức thanh toán
                    </label>
                    <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                    >
                        <option value="CASH">Tiền mặt</option>
                        <option value="BANK_TRANSFER">Chuyển khoản</option>
                        <option value="CREDIT_CARD">Thẻ tín dụng</option>
                        <option value="OTHER">Khác</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">Ghi chú</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
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
                        {submitting ? "Đang lưu..." : "Lưu tiền đặt cọc"}
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

export default function CreateDepositPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateDepositContent />
        </Suspense>
    );
}


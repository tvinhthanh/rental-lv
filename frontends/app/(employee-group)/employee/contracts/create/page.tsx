 "use client";

import { useEffect, useState, Suspense, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { bookingService } from "@/services/booking.service";
import { rentalProcessService } from "@/services/rental-process.service";

function CreateContractContent() {
    const params = useSearchParams();
    const router = useRouter();
    const bookingId = params.get("bookingId") ?? "";

    const [booking, setBooking] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [totalAmount, setTotalAmount] = useState<string>("");
    const [terms, setTerms] = useState<string>("Default rental contract terms...");
    const [notes, setNotes] = useState<string>("");

    // Validation errors
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

                // Prefill fields
                if (b?.pickupDate) {
                    setStartDate(new Date(b.pickupDate).toISOString().slice(0, 10));
                }
                if (b?.returnDate) {
                    setEndDate(new Date(b.returnDate).toISOString().slice(0, 10));
                }
                if (b?.totalAmount != null) {
                    setTotalAmount(String(b.totalAmount));
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

        // Validate startDate
        if (!startDate) {
            newErrors.startDate = "Ngày bắt đầu hợp đồng là bắt buộc";
        }

        // Validate endDate
        if (!endDate) {
            newErrors.endDate = "Ngày kết thúc hợp đồng là bắt buộc";
        } else if (startDate && new Date(endDate) <= new Date(startDate)) {
            newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
        }

        // Validate totalAmount
        if (!totalAmount || totalAmount.trim() === "") {
            newErrors.totalAmount = "Tổng tiền hợp đồng là bắt buộc";
        } else {
            const amount = Number(totalAmount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.totalAmount = "Tổng tiền phải lớn hơn 0";
            }
        }


        // Validate terms
        if (!terms || terms.trim() === "") {
            newErrors.terms = "Điều khoản hợp đồng là bắt buộc";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!bookingId) return;

        // Validate form trước khi submit
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
            };

            if (startDate) payload.startDate = startDate;
            if (endDate) payload.endDate = endDate;
            if (totalAmount) payload.totalAmount = Number(totalAmount);
            if (terms) payload.terms = terms;
            if (notes) payload.notes = notes;

            const created = await rentalProcessService.createContract(payload);

            let successMsg = "Tạo hợp đồng thành công";
            if (created?.pdfGenerated) {
                successMsg += " • PDF hợp đồng đã được tạo và lưu";
            } else if (created?.pdfError) {
                successMsg += ` • Lưu ý: PDF hợp đồng chưa được tạo (${created.pdfError})`;
            } else {
                successMsg += " • Lưu ý: PDF hợp đồng chưa được tạo";
            }

            setSuccess(successMsg);

            // Chuyển về trang danh sách hợp đồng và tự động mở modal chi tiết
            setTimeout(() => {
                router.push(`/employee/contracts?contractId=${created.id}`);
            }, 1500);
        } catch (e: any) {
            console.error("Create contract failed", e);
            setError(e?.message || "Tạo hợp đồng thất bại");
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

    if (error) {
        return (
            <div className="p-6 text-red-400">
                {error}
            </div>
        );
    }

    return (
        <div className="p-6 text-gray-200 max-w-3xl">
            <h1 className="text-2xl font-bold mb-4">
                Tạo hợp đồng thuê xe
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
                            Ngày bắt đầu hợp đồng <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                if (errors.startDate) {
                                    setErrors({ ...errors, startDate: "" });
                                }
                            }}
                            className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                errors.startDate ? "border-red-500" : "border-slate-600"
                            }`}
                        />
                        {errors.startDate && (
                            <p className="mt-1 text-xs text-red-400">{errors.startDate}</p>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-300 mb-1">
                            Ngày kết thúc hợp đồng <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                if (errors.endDate) {
                                    setErrors({ ...errors, endDate: "" });
                                }
                            }}
                            min={startDate || undefined}
                            className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                errors.endDate ? "border-red-500" : "border-slate-600"
                            }`}
                        />
                        {errors.endDate && (
                            <p className="mt-1 text-xs text-red-400">{errors.endDate}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Tổng tiền hợp đồng <span className="text-red-400">*</span>
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
                    <p className="mt-1 text-xs text-slate-500">
                        Lưu ý: Tiền đặt cọc sẽ được tạo riêng sau khi có hợp đồng
                    </p>
                </div>

                <div>
                    <label className="block text-sm text-gray-300 mb-1">
                        Điều khoản hợp đồng <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={terms}
                        onChange={(e) => {
                            setTerms(e.target.value);
                            if (errors.terms) {
                                setErrors({ ...errors, terms: "" });
                            }
                        }}
                        rows={4}
                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                            errors.terms ? "border-red-500" : "border-slate-600"
                        }`}
                    />
                    {errors.terms && (
                        <p className="mt-1 text-xs text-red-400">{errors.terms}</p>
                    )}
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
                        {submitting ? "Đang lưu..." : "Lưu hợp đồng"}
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

export default function CreateContractPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CreateContractContent />
        </Suspense>
    );
}

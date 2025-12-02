"use client";

import { useState, useEffect, FormEvent } from "react";
import { AlertTriangle } from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";

type CreateReturnModalProps = {
    branchId: string;
    onClose: () => void;
    onSuccess: () => void;
};

export default function CreateReturnModal({ branchId, onClose, onSuccess }: CreateReturnModalProps) {
    const { data: user } = useCurrentUser();
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [selectedBookingId, setSelectedBookingId] = useState<string>("");
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
    const [loadingBooking, setLoadingBooking] = useState(false);
    const [employee, setEmployee] = useState<any | null>(null);

    // Form state
    const [odoEnd, setOdoEnd] = useState<string>("");
    const [fuelLevelEnd, setFuelLevelEnd] = useState<string>("");
    const [damageNote, setDamageNote] = useState<string>("");
    const [extraCharge, setExtraCharge] = useState<string>("");
    const [condition, setCondition] = useState<string>("GOOD");
    const [checklist, setChecklist] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [returnBranchId, setReturnBranchId] = useState<string>("");
    
    // Photo upload state
    const [photoUrls, setPhotoUrls] = useState<string[]>([]);
    const [uploadingPhotos, setUploadingPhotos] = useState(false);

    // Surcharge fields
    const [fuelSurchargeAmount, setFuelSurchargeAmount] = useState<string>("");
    const [overKmSurchargeAmount, setOverKmSurchargeAmount] = useState<string>("");
    const [damageSurchargeAmount, setDamageSurchargeAmount] = useState<string>("");
    const [fuelPricePerPercent, setFuelPricePerPercent] = useState<string>("");
    const [overKmPricePerKm, setOverKmPricePerKm] = useState<string>("");
    const [allowedKm, setAllowedKm] = useState<string>("");

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
                if (emp?.branchId) {
                    setReturnBranchId(emp.branchId);
                }
            } catch (e) {
                console.error("Load employee failed", e);
            }
        }
        loadEmployee();
    }, [user]);

    // Load bookings có handover nhưng chưa có return report
    useEffect(() => {
        async function loadBookings() {
            try {
                setLoadingBookings(true);
                const res = await bookingService.getByBranch(branchId);
                const items = Array.isArray(res?.items) ? res.items : (Array.isArray(res) ? res : []);
                
                // Lọc bookings có contract, deposit, handover nhưng chưa có return report và status là ONGOING
                const filtered = items.filter((b: any) => {
                    const pass = b.contract && b.deposit && b.handover && !b.returnReport && b.status === "ONGOING";
                    return pass;
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

                // Prefill từ handover nếu có
                if (b.handover) {
                    if (b.handover.odoStart) {
                        setOdoEnd(String(b.handover.odoStart));
                        // Set allowedKm = odoStart (mặc định)
                        setAllowedKm(String(b.handover.odoStart));
                    }
                    if (b.handover.fuelLevelStart !== null && b.handover.fuelLevelStart !== undefined) {
                        setFuelLevelEnd(String(b.handover.fuelLevelStart));
                    }
                }
            } catch (e) {
                console.error("Load booking failed", e);
            } finally {
                setLoadingBooking(false);
            }
        }

        loadBooking();
    }, [selectedBookingId]);

    // Tự động tính phí thiếu nhiên liệu (chỉ khi người dùng chưa nhập thủ công)
    useEffect(() => {
        const handover = selectedBooking?.handover;
        if (handover?.fuelLevelStart !== null && fuelLevelEnd && fuelPricePerPercent) {
            const fuelDiff = handover.fuelLevelStart - Number(fuelLevelEnd);
            if (fuelDiff > 0) {
                const calculated = fuelDiff * Number(fuelPricePerPercent);
                // Chỉ tự động điền nếu chưa có giá trị hoặc giá trị hiện tại khác với giá trị tính toán
                if (!fuelSurchargeAmount) {
                    setFuelSurchargeAmount(String(Math.round(calculated)));
                }
            } else if (!fuelSurchargeAmount) {
                setFuelSurchargeAmount("");
            }
        }
    }, [selectedBooking?.handover?.fuelLevelStart, fuelLevelEnd, fuelPricePerPercent, fuelSurchargeAmount]);

    // Tự động tính phí vượt km (chỉ khi người dùng chưa nhập thủ công)
    useEffect(() => {
        const handover = selectedBooking?.handover;
        if (handover?.odoStart && odoEnd && allowedKm && overKmPricePerKm) {
            const kmDiff = Number(odoEnd) - Number(allowedKm);
            if (kmDiff > 0) {
                const calculated = kmDiff * Number(overKmPricePerKm);
                // Chỉ tự động điền nếu chưa có giá trị
                if (!overKmSurchargeAmount) {
                    setOverKmSurchargeAmount(String(Math.round(calculated)));
                }
            } else if (!overKmSurchargeAmount) {
                setOverKmSurchargeAmount("");
            }
        }
    }, [selectedBooking?.handover?.odoStart, odoEnd, allowedKm, overKmPricePerKm, overKmSurchargeAmount]);

    // Upload ảnh lên Cloudinary
    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploadingPhotos(true);
        try {
            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });

            const token = localStorage.getItem('accessToken');
            const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || '';
            const response = await fetch(`${apiUrl}/upload/images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload ảnh thất bại');
            }

            const data = await response.json();
            const uploadedUrls = data?.urls || [];
            setPhotoUrls([...photoUrls, ...uploadedUrls]);
        } catch (err: any) {
            console.error('Upload photos failed:', err);
            setError(err?.message || 'Upload ảnh thất bại');
        } finally {
            setUploadingPhotos(false);
        }
    }

    function removePhoto(index: number) {
        setPhotoUrls(photoUrls.filter((_, i) => i !== index));
    }

    function validateForm(): boolean {
        const newErrors: Record<string, string> = {};
        if (!selectedBookingId) {
            newErrors.bookingId = "Vui lòng chọn booking";
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
            };

            if (odoEnd) payload.odoEnd = Number(odoEnd);
            if (fuelLevelEnd) payload.fuelLevelEnd = Number(fuelLevelEnd);
            if (damageNote) payload.damageNote = damageNote;
            if (extraCharge) payload.extraCharge = Number(extraCharge);
            if (condition) payload.condition = condition;
            if (checklist) payload.checklist = checklist;
            if (note) payload.note = note;
            if (returnBranchId) payload.returnBranchId = returnBranchId;
            if (photoUrls.length > 0) payload.photoUrls = photoUrls;

            // Surcharge fields
            if (fuelSurchargeAmount) payload.fuelSurchargeAmount = Number(fuelSurchargeAmount);
            if (overKmSurchargeAmount) payload.overKmSurchargeAmount = Number(overKmSurchargeAmount);
            if (damageSurchargeAmount) payload.damageSurchargeAmount = Number(damageSurchargeAmount);
            if (fuelPricePerPercent) payload.fuelPricePerPercent = Number(fuelPricePerPercent);
            if (overKmPricePerKm) payload.overKmPricePerKm = Number(overKmPricePerKm);
            if (allowedKm) payload.allowedKm = Number(allowedKm);

            await rentalProcessService.createReturnReport(payload);

            setSuccess("Tạo phiếu trả xe thành công");
            setTimeout(() => {
                onSuccess();
            }, 1500);
        } catch (e: any) {
            console.error("Create return report failed", e);
            setError(e?.message || "Tạo phiếu trả xe thất bại");
        } finally {
            setSubmitting(false);
        }
    }

    const handover = selectedBooking?.handover;
    const contract = selectedBooking?.contract;
    const deposit = selectedBooking?.deposit;

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-2xl font-bold text-white">
                        Tạo phiếu trả xe
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
                            Chọn Booking <span className="text-red-400">*</span>
                        </label>
                        {loadingBookings ? (
                            <p className="text-sm text-slate-400">Đang tải danh sách booking...</p>
                        ) : bookings.length === 0 ? (
                            <p className="text-sm text-yellow-400">Không có booking nào có contract, deposit, handover và status ONGOING, chưa có return report.</p>
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
                                        {b.bookingCode} - {b.customer?.fullName} - {b.vehicle?.name} ({b.vehicle?.licensePlate}) - {b.status}
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

                            {/* Handover Info */}
                            {handover && (
                                <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                    <h3 className="text-sm font-semibold text-emerald-300 mb-2">✓ Phiếu giao xe</h3>
                                    <p><b>Số km đầu:</b> {handover.odoStart || "—"}</p>
                                    <p><b>Mức nhiên liệu đầu:</b> {handover.fuelLevelStart !== null ? `${handover.fuelLevelStart}%` : "—"}</p>
                                    <p><b>Nơi nhận:</b> {handover.pickupPlace || "—"}</p>
                                    <p><b>Tình trạng:</b> {handover.exteriorStatus || "—"} / {handover.interiorStatus || "—"}</p>
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

                    {/* Form tạo Return Report */}
                    {selectedBooking && !loadingBooking && (
                        <div className="border-t border-slate-800 pt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-white">Thông tin trả xe</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Số km cuối
                                    </label>
                                    <input
                                        type="number"
                                        value={odoEnd}
                                        onChange={(e) => setOdoEnd(e.target.value)}
                                        min="0"
                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                        placeholder={handover?.odoStart ? `Đầu: ${handover.odoStart}` : ""}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-300 mb-1">
                                        Mức nhiên liệu cuối (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={fuelLevelEnd}
                                        onChange={(e) => setFuelLevelEnd(e.target.value)}
                                        min="0"
                                        max="100"
                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                        placeholder={handover?.fuelLevelStart !== null ? `Đầu: ${handover.fuelLevelStart}%` : ""}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Tình trạng</label>
                                <select
                                    value={condition}
                                    onChange={(e) => setCondition(e.target.value)}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                >
                                    <option value="GOOD">Tốt</option>
                                    <option value="FAIR">Khá</option>
                                    <option value="POOR">Kém</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Phí phát sinh chung</label>
                                <input
                                    type="number"
                                    value={extraCharge}
                                    onChange={(e) => setExtraCharge(e.target.value)}
                                    min="0"
                                    step="1000"
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                    placeholder="Nhập phí phát sinh nếu có"
                                />
                            </div>

                            {/* Section: Phí phát sinh chi tiết */}
                            <div className="border-t border-slate-800 pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-yellow-300 mb-3">Phí phát sinh chi tiết</h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Fuel Surcharge */}
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Giá mỗi % nhiên liệu thiếu
                                        </label>
                                        <input
                                            type="number"
                                            value={fuelPricePerPercent}
                                            onChange={(e) => setFuelPricePerPercent(e.target.value)}
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-gray-100"
                                            placeholder="VD: 50000"
                                        />
                                        {handover?.fuelLevelStart !== null && fuelLevelEnd && fuelPricePerPercent && Number(fuelLevelEnd) < handover.fuelLevelStart && (
                                            <p className="text-xs text-yellow-400">
                                                Tự động tính: {(handover.fuelLevelStart - Number(fuelLevelEnd)) * Number(fuelPricePerPercent) || 0} đ
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Phí thiếu nhiên liệu (tổng)
                                        </label>
                                        <input
                                            type="number"
                                            value={fuelSurchargeAmount}
                                            onChange={(e) => setFuelSurchargeAmount(e.target.value)}
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-gray-100"
                                            placeholder="Nhập hoặc để tự động tính"
                                        />
                                    </div>

                                    {/* Over KM Surcharge */}
                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Số km được phép
                                        </label>
                                        <input
                                            type="number"
                                            value={allowedKm}
                                            onChange={(e) => setAllowedKm(e.target.value)}
                                            min="0"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-gray-100"
                                            placeholder={handover?.odoStart ? `Đầu: ${handover.odoStart}` : ""}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Giá mỗi km vượt
                                        </label>
                                        <input
                                            type="number"
                                            value={overKmPricePerKm}
                                            onChange={(e) => setOverKmPricePerKm(e.target.value)}
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-gray-100"
                                            placeholder="VD: 10000"
                                        />
                                        {handover?.odoStart && odoEnd && allowedKm && overKmPricePerKm && Number(odoEnd) > Number(allowedKm) && (
                                            <p className="text-xs text-yellow-400">
                                                Tự động tính: {(Number(odoEnd) - Number(allowedKm)) * Number(overKmPricePerKm) || 0} đ
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs text-gray-400 mb-1">
                                            Phí vượt km (tổng)
                                        </label>
                                        <input
                                            type="number"
                                            value={overKmSurchargeAmount}
                                            onChange={(e) => setOverKmSurchargeAmount(e.target.value)}
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-xs text-gray-100"
                                            placeholder="Nhập hoặc để tự động tính"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section: Hư hỏng và ảnh */}
                            <div className="border-t border-slate-800 pt-4 mt-4">
                                <h4 className="text-sm font-semibold text-red-300 mb-3">Hư hỏng và bằng chứng</h4>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">
                                            Ghi chú hư hỏng
                                        </label>
                                        <textarea
                                            value={damageNote}
                                            onChange={(e) => setDamageNote(e.target.value)}
                                            rows={3}
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            placeholder="Mô tả chi tiết về hư hỏng..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-1">
                                            Chi phí sửa chữa hư hỏng <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={damageSurchargeAmount}
                                            onChange={(e) => setDamageSurchargeAmount(e.target.value)}
                                            min="0"
                                            step="1000"
                                            className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            placeholder="Nhập chi phí sửa chữa hư hỏng"
                                        />
                                        {damageNote && !damageSurchargeAmount && (
                                            <p className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Vui lòng nhập chi phí sửa chữa nếu có hư hỏng
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm text-gray-300 mb-2">
                                            Ảnh chứng minh hư hỏng
                                        </label>
                                        <div className="space-y-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handlePhotoUpload}
                                                disabled={uploadingPhotos}
                                                className="hidden"
                                                id="photo-upload"
                                            />
                                            <label
                                                htmlFor="photo-upload"
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                                                    uploadingPhotos
                                                        ? 'bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed'
                                                        : 'bg-slate-800 border-slate-600 text-gray-300 hover:bg-slate-700'
                                                }`}
                                            >
                                                {uploadingPhotos ? (
                                                    <>
                                                        <span className="animate-spin">⏳</span>
                                                        <span>Đang upload...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>📷</span>
                                                        <span>Chọn ảnh (có thể chọn nhiều)</span>
                                                    </>
                                                )}
                                            </label>

                                            {photoUrls.length > 0 && (
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                                    {photoUrls.map((url, index) => (
                                                        <div key={index} className="relative group">
                                                            <img
                                                                src={url}
                                                                alt={`Ảnh ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg border border-slate-700"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removePhoto(index)}
                                                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Checklist</label>
                                <textarea
                                    value={checklist}
                                    onChange={(e) => setChecklist(e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                    placeholder="Checklist kiểm tra xe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Ghi chú</label>
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
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
                            {submitting ? "Đang lưu..." : "Lưu phiếu trả xe"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

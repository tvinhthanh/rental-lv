"use client";

import { useState, useEffect, FormEvent } from "react";
import { depositService } from "@/services/deposit.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import DepositModal from "@/app/(employee-group)/employee/deposits/_components/DepositModal";
import HandoverModal from "@/app/(employee-group)/employee/handover/_components/HandoverModal";

type ContractModalProps = {
    contract: any;
    onClose: () => void;
    onRefresh?: () => void;
};

export default function ContractModal({ contract, onClose, onRefresh }: ContractModalProps) {
    const [downloading, setDownloading] = useState(false);
    const [showForms, setShowForms] = useState(false);
    const { data: user } = useCurrentUser();
    
    // Deposit form state
    const [depositType, setDepositType] = useState<string>("CASH"); // CASH, VEHICLE, PROPERTY, ITEM
    const [depositTotalAmount, setDepositTotalAmount] = useState<string>("");
    const [depositPaymentMethod, setDepositPaymentMethod] = useState<string>("CASH");
    const [depositNotes, setDepositNotes] = useState<string>("");
    const [depositSubmitting, setDepositSubmitting] = useState(false);
    const [depositError, setDepositError] = useState<string | null>(null);
    const [depositSuccess, setDepositSuccess] = useState<string | null>(null);
    const [depositErrors, setDepositErrors] = useState<Record<string, string>>({});
    const [hasDeposit, setHasDeposit] = useState(false);
    const [checkingDeposit, setCheckingDeposit] = useState(false);
    const [createdDeposit, setCreatedDeposit] = useState<any | null>(null);
    const [existingDeposit, setExistingDeposit] = useState<any | null>(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    
    // Deposit Detail form state (for VEHICLE, PROPERTY, ITEM)
    const [depositDetailItemName, setDepositDetailItemName] = useState<string>("");
    const [depositDetailIdentifier, setDepositDetailIdentifier] = useState<string>("");
    const [depositDetailAmount, setDepositDetailAmount] = useState<string>("");
    const [depositDetailCondition, setDepositDetailCondition] = useState<string>("GOOD");
    const [depositDetailNotes, setDepositDetailNotes] = useState<string>("");
    const [depositDetailErrors, setDepositDetailErrors] = useState<Record<string, string>>({});
    
    // Handover form state
    const [handoverOdoStart, setHandoverOdoStart] = useState<string>("");
    const [handoverFuelLevelStart, setHandoverFuelLevelStart] = useState<string>("");
    const [handoverPickupPlace, setHandoverPickupPlace] = useState<string>("");
    const [handoverExteriorStatus, setHandoverExteriorStatus] = useState<string>("GOOD");
    const [handoverInteriorStatus, setHandoverInteriorStatus] = useState<string>("GOOD");
    const [handoverDamageNote, setHandoverDamageNote] = useState<string>("");
    const [handoverAccessories, setHandoverAccessories] = useState<string>("");
    const [handoverHandedOverBy, setHandoverHandedOverBy] = useState<string>("");
    const [handoverSubmitting, setHandoverSubmitting] = useState(false);
    const [handoverError, setHandoverError] = useState<string | null>(null);
    const [handoverSuccess, setHandoverSuccess] = useState<string | null>(null);
    const [handoverErrors, setHandoverErrors] = useState<Record<string, string>>({});
    const [hasHandover, setHasHandover] = useState(false);
    const [checkingHandover, setCheckingHandover] = useState(false);
    const [existingHandover, setExistingHandover] = useState<any | null>(null);
    const [showHandoverModal, setShowHandoverModal] = useState(false);
    const [employee, setEmployee] = useState<any | null>(null);

    if (!contract) return null;

    async function handleDownload() {
        if (!contract.fileUrl) return;

        try {
            setDownloading(true);
            // Fetch file từ Cloudinary
            const response = await fetch(contract.fileUrl);
            const blob = await response.blob();

            // Tạo blob URL với type PDF
            const blobUrl = window.URL.createObjectURL(
                new Blob([blob], { type: "application/pdf" })
            );

            // Tạo link tạm để download
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = `hop-dong-${contract.contractNo}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Download failed:", error);
            // Fallback: mở link trực tiếp
            window.open(contract.fileUrl, "_blank");
        } finally {
            setDownloading(false);
        }
    }

    const booking = contract.booking;
    const customer = booking?.customer;
    const vehicle = booking?.vehicle;
    const bookingId = booking?.id;

    // Load employee data
    useEffect(() => {
        if (!user?.id) return;
        async function loadEmployee() {
            try {
                const empRes = await employeeService.getUser(user.id);
                const emp = empRes?.data || empRes;
                setEmployee(emp);
                setHandoverHandedOverBy(emp?.fullName || "");
            } catch (e) {
                console.error("Load employee failed", e);
            }
        }
        loadEmployee();
    }, [user]);

    // Check if deposit/handover already exists
    useEffect(() => {
        if (!bookingId) return;
        async function checkExisting() {
            setCheckingDeposit(true);
            setCheckingHandover(true);
            try {
                // Check deposit
                try {
                    const depositRes = await depositService.get(bookingId);
                    const depositData = depositRes?.data || depositRes;
                    if (depositData) {
                        setHasDeposit(true);
                        setExistingDeposit(depositData);
                    } else {
                        setHasDeposit(false);
                        setExistingDeposit(null);
                    }
                } catch (e: any) {
                    if (e?.response?.status !== 404) {
                        console.error("Check deposit failed", e);
                    }
                    setHasDeposit(false);
                    setExistingDeposit(null);
                }

                // Check handover
                try {
                    const handoverRes = await rentalProcessService.handover(bookingId);
                    const handoverData = handoverRes?.data || handoverRes;
                    if (handoverData) {
                        setHasHandover(true);
                        setExistingHandover(handoverData);
                    } else {
                        setHasHandover(false);
                        setExistingHandover(null);
                    }
                } catch (e: any) {
                    if (e?.response?.status !== 404) {
                        console.error("Check handover failed", e);
                    }
                    setHasHandover(false);
                    setExistingHandover(null);
                }
            } finally {
                setCheckingDeposit(false);
                setCheckingHandover(false);
            }
        }
        checkExisting();
    }, [bookingId]);

    // Prefill deposit amount from contract
    useEffect(() => {
        if (contract?.depositAmount) {
            setDepositTotalAmount(String(contract.depositAmount));
        } else if (booking?.totalAmount) {
            setDepositTotalAmount(String(Math.round(booking.totalAmount * 0.3)));
        }
    }, [contract, booking]);

    // Deposit form validation
    function validateDepositForm(): boolean {
        const newErrors: Record<string, string> = {};
        if (!depositTotalAmount || depositTotalAmount.trim() === "") {
            newErrors.totalAmount = "Tổng tiền đặt cọc là bắt buộc";
        } else {
            const amount = Number(depositTotalAmount);
            if (isNaN(amount) || amount <= 0) {
                newErrors.totalAmount = "Tổng tiền phải lớn hơn 0";
            }
        }
        setDepositErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Deposit Detail form validation
    function validateDepositDetailForm(): boolean {
        const newErrors: Record<string, string> = {};
        if (depositType !== "CASH") {
            if (!depositDetailItemName || depositDetailItemName.trim() === "") {
                newErrors.itemName = "Tên vật phẩm/xe/căn hộ là bắt buộc";
            }
            if (!depositDetailAmount || depositDetailAmount.trim() === "") {
                newErrors.amount = "Định giá là bắt buộc";
            } else {
                const amount = Number(depositDetailAmount);
                if (isNaN(amount) || amount <= 0) {
                    newErrors.amount = "Định giá phải lớn hơn 0";
                }
            }
        }
        setDepositDetailErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Handover form validation
    function validateHandoverForm(): boolean {
        const newErrors: Record<string, string> = {};
        if (!handoverOdoStart || handoverOdoStart.trim() === "") {
            newErrors.odoStart = "Số km đầu là bắt buộc";
        } else {
            const odo = Number(handoverOdoStart);
            if (isNaN(odo) || odo < 0) {
                newErrors.odoStart = "Số km phải >= 0";
            }
        }
        if (handoverFuelLevelStart && handoverFuelLevelStart.trim() !== "") {
            const fuel = Number(handoverFuelLevelStart);
            if (isNaN(fuel) || fuel < 0 || fuel > 100) {
                newErrors.fuelLevelStart = "Mức nhiên liệu phải từ 0-100%";
            }
        }
        setHandoverErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // Submit deposit
    async function handleSubmitDeposit(e: FormEvent) {
        e.preventDefault();
        if (!bookingId || !customer?.id) return;

        if (!validateDepositForm()) {
            setDepositError("Vui lòng kiểm tra lại các trường không hợp lệ");
            return;
        }

        // Validate deposit detail if type is not CASH
        if (depositType !== "CASH" && !validateDepositDetailForm()) {
            setDepositError("Vui lòng kiểm tra lại thông tin chi tiết đặt cọc");
            return;
        }

        setDepositError(null);
        setDepositSuccess(null);
        setDepositSubmitting(true);

        try {
            // Create deposit
            const payload: any = {
                bookingId,
                customerId: customer.id,
                totalAmount: Number(depositTotalAmount),
                status: "HELD",
            };
            // PaymentMethod chỉ áp dụng khi là CASH
            if (depositType === "CASH") {
                payload.paymentMethod = depositPaymentMethod || "CASH";
            }
            // Khi là VEHICLE/PROPERTY/ITEM, không cần paymentMethod (hoặc có thể để null)
            if (depositNotes) payload.notes = depositNotes;

            const createdDepositRes = await depositService.create(payload);
            const depositData = createdDepositRes?.data || createdDepositRes;
            const depositId = depositData?.id;

            // Create deposit detail if type is not CASH
            if (depositType !== "CASH" && depositId) {
                const detailPayload: any = {
                    depositId,
                    itemType: depositType,
                    itemName: depositDetailItemName,
                    amount: Number(depositDetailAmount),
                    condition: depositDetailCondition || "GOOD",
                };
                if (depositDetailIdentifier) detailPayload.identifier = depositDetailIdentifier;
                if (depositDetailNotes) detailPayload.notes = depositDetailNotes;

                await depositService.addDetail(detailPayload);
            }

            // Reload deposit để lấy đầy đủ thông tin (bao gồm items, booking, customer)
            if (depositId && bookingId) {
                const updatedDeposit = await depositService.get(bookingId);
                const updatedData = updatedDeposit?.data || updatedDeposit;
                setCreatedDeposit(updatedData);
            } else {
                setCreatedDeposit(depositData);
            }

            setDepositSuccess("Tạo tiền đặt cọc thành công");
            setHasDeposit(true);
            
            // Reset form
            setDepositType("CASH");
            setDepositTotalAmount("");
            setDepositNotes("");
            setDepositDetailItemName("");
            setDepositDetailIdentifier("");
            setDepositDetailAmount("");
            setDepositDetailCondition("GOOD");
            setDepositDetailNotes("");
            
            if (onRefresh) onRefresh();
        } catch (e: any) {
            console.error("Create deposit failed", e);
            setDepositError(e?.message || "Tạo tiền đặt cọc thất bại");
        } finally {
            setDepositSubmitting(false);
        }
    }

    // Submit handover
    async function handleSubmitHandover(e: FormEvent) {
        e.preventDefault();
        if (!bookingId) return;

        if (!validateHandoverForm()) {
            setHandoverError("Vui lòng kiểm tra lại các trường không hợp lệ");
            return;
        }

        setHandoverError(null);
        setHandoverSuccess(null);
        setHandoverSubmitting(true);

        try {
            const payload: any = {
                bookingId,
                odoStart: Number(handoverOdoStart),
                pickupPlace: handoverPickupPlace || undefined,
                exteriorStatus: handoverExteriorStatus || undefined,
                interiorStatus: handoverInteriorStatus || undefined,
                handedOverBy: handoverHandedOverBy || undefined,
            };
            if (handoverFuelLevelStart) payload.fuelLevelStart = Number(handoverFuelLevelStart);
            if (handoverDamageNote) payload.damageNote = handoverDamageNote;
            if (handoverAccessories) payload.accessories = handoverAccessories;
            if (employee?.id) payload.employeeId = employee.id;

            await rentalProcessService.createHandover(payload);
            
            // Reload handover để lấy đầy đủ thông tin (bao gồm booking, customer, vehicle, employee)
            if (bookingId) {
                const updatedHandover = await rentalProcessService.handover(bookingId);
                const handoverData = updatedHandover?.data || updatedHandover;
                setExistingHandover(handoverData);
            }
            
            setHandoverSuccess("Tạo phiếu giao xe thành công");
            setHasHandover(true);
            if (onRefresh) onRefresh();
        } catch (e: any) {
            console.error("Create handover failed", e);
            setHandoverError(e?.message || "Tạo phiếu giao xe thất bại");
        } finally {
            setHandoverSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Hợp đồng #{contract.contractNo}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Booking: {booking?.bookingCode} • Trạng thái:{" "}
                            <span className="text-emerald-400 font-semibold">
                                {contract.status}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm text-slate-200">
                    {/* Customer */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin khách hàng
                        </h3>
                        <p><b>Họ tên:</b> {customer?.fullName || "—"}</p>
                        <p><b>Điện thoại:</b> {customer?.phone || "—"}</p>
                        <p><b>Email:</b> {customer?.email || "—"}</p>
                        <p><b>Địa chỉ:</b> {customer?.address || "—"}</p>
                    </section>

                    {/* Vehicle */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin xe
                        </h3>
                        <p><b>Tên xe:</b> {vehicle?.name}</p>
                        <p><b>Biển số:</b> {vehicle?.licensePlate}</p>
                        <p><b>Loại xe:</b> {vehicle?.vehicleType}</p>
                        <p><b>Màu:</b> {vehicle?.color}</p>
                    </section>

                    {/* Dates & money */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thời gian thuê
                        </h3>
                        <p>
                            <b>Ngày bắt đầu:</b>{" "}
                            {contract.startDate &&
                                new Date(contract.startDate).toLocaleDateString("vi-VN")}
                        </p>
                        <p>
                            <b>Ngày kết thúc:</b>{" "}
                            {contract.endDate &&
                                new Date(contract.endDate).toLocaleDateString("vi-VN")}
                        </p>
                    </section>

                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thanh toán
                        </h3>
                        <p>
                            <b>Tổng tiền:</b>{" "}
                            {(contract.totalAmount ?? booking?.totalAmount ?? 0).toLocaleString("vi-VN")} đ
                        </p>
                        {typeof contract.depositAmount === "number" && (
                            <p>
                                <b>Tiền đặt cọc (trên hợp đồng):</b>{" "}
                                {contract.depositAmount.toLocaleString("vi-VN")} đ
                            </p>
                        )}
                    </section>

                    {/* Terms & notes */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Điều khoản & ghi chú
                        </h3>
                        <div className="text-xs text-slate-300 whitespace-pre-line border border-slate-800 rounded-lg p-3 bg-slate-950/60 max-h-48 overflow-y-auto">
                            {contract.terms || "Không có điều khoản."}
                        </div>
                        {contract.notes && (
                            <p className="text-xs text-slate-400">
                                <b>Ghi chú:</b> {contract.notes}
                            </p>
                        )}
                    </section>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex justify-between items-center gap-4">
                    <div className="flex gap-3 flex-wrap">
                        {contract.fileUrl ? (
                            <>
                                <a
                                    href={contract.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                                >
                                    👁 Xem PDF hợp đồng
                                </a>
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="text-sm text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {downloading ? "Đang tải..." : "⬇ Tải PDF hợp đồng"}
                                </button>
                            </>
                        ) : (
                            <p className="text-xs text-slate-500">
                                Chưa có file PDF hợp đồng được lưu.
                            </p>
                        )}
                        
                        {bookingId && (
                            <button
                                onClick={() => setShowForms(!showForms)}
                                className="px-4 py-2 text-sm rounded-lg bg-purple-600 hover:bg-purple-500 text-white"
                            >
                                {showForms ? "Ẩn" : "Tạo"} Phiếu cọc & Đơn giao xe
                            </button>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        Đóng
                    </button>
                </div>

                {/* Forms section - side by side */}
                {showForms && bookingId && (
                    <div className="mt-6 border-t border-slate-800 pt-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Tạo Phiếu cọc & Đơn giao xe
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Deposit Form */}
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                <h4 className="text-base font-semibold text-blue-300 mb-3">
                                    Phiếu đặt cọc
                                    {checkingDeposit ? (
                                        <span className="ml-2 text-xs text-slate-400">(Đang kiểm tra...)</span>
                                    ) : hasDeposit ? (
                                        <span className="ml-2 text-xs text-emerald-400">(Đã tạo)</span>
                                    ) : null}
                                </h4>
                                
                                {hasDeposit ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-emerald-400">
                                            Phiếu đặt cọc đã được tạo cho booking này.
                                        </p>
                                        {(existingDeposit || createdDeposit) && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setCreatedDeposit(existingDeposit || createdDeposit);
                                                    setShowDepositModal(true);
                                                }}
                                                className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm"
                                            >
                                                👁 Xem chi tiết phiếu đặt cọc
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitDeposit} className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">
                                                Loại đặt cọc <span className="text-red-400">*</span>
                                            </label>
                                            <select
                                                value={depositType}
                                                onChange={(e) => {
                                                    setDepositType(e.target.value);
                                                    // Reset detail form when changing type
                                                    setDepositDetailItemName("");
                                                    setDepositDetailIdentifier("");
                                                    setDepositDetailAmount("");
                                                    setDepositDetailCondition("GOOD");
                                                    setDepositDetailNotes("");
                                                }}
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            >
                                                <option value="CASH">Tiền mặt</option>
                                                <option value="VEHICLE">Xe</option>
                                                <option value="PROPERTY">Căn hộ/Tài sản</option>
                                                <option value="ITEM">Vật phẩm</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">
                                                Tổng tiền đặt cọc <span className="text-red-400">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={depositTotalAmount}
                                                onChange={(e) => {
                                                    setDepositTotalAmount(e.target.value);
                                                    if (depositErrors.totalAmount) {
                                                        setDepositErrors({ ...depositErrors, totalAmount: "" });
                                                    }
                                                }}
                                                min="0"
                                                step="1000"
                                                className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                                    depositErrors.totalAmount ? "border-red-500" : "border-slate-600"
                                                }`}
                                            />
                                            {depositErrors.totalAmount && (
                                                <p className="mt-1 text-xs text-red-400">{depositErrors.totalAmount}</p>
                                            )}
                                        </div>

                                        {/* Payment method chỉ hiển thị khi là CASH */}
                                        {depositType === "CASH" && (
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">
                                                    Phương thức thanh toán
                                                </label>
                                                <select
                                                    value={depositPaymentMethod}
                                                    onChange={(e) => setDepositPaymentMethod(e.target.value)}
                                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                >
                                                    <option value="CASH">Tiền mặt</option>
                                                    <option value="BANK_TRANSFER">Chuyển khoản</option>
                                                    <option value="CREDIT_CARD">Thẻ tín dụng</option>
                                                    <option value="OTHER">Khác</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Deposit Detail Form - hiển thị khi không phải CASH */}
                                        {depositType !== "CASH" && (
                                            <div className="border-t border-slate-700 pt-3 space-y-3">
                                                <p className="text-xs font-semibold text-blue-300 mb-2">
                                                    Chi tiết {depositType === "VEHICLE" ? "xe" : depositType === "PROPERTY" ? "căn hộ/tài sản" : "vật phẩm"}
                                                </p>
                                                
                                                <div>
                                                    <label className="block text-xs text-gray-300 mb-1">
                                                        Tên {depositType === "VEHICLE" ? "xe" : depositType === "PROPERTY" ? "căn hộ/tài sản" : "vật phẩm"} <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={depositDetailItemName}
                                                        onChange={(e) => {
                                                            setDepositDetailItemName(e.target.value);
                                                            if (depositDetailErrors.itemName) {
                                                                setDepositDetailErrors({ ...depositDetailErrors, itemName: "" });
                                                            }
                                                        }}
                                                        placeholder={depositType === "VEHICLE" ? "VD: Honda Civic" : depositType === "PROPERTY" ? "VD: Căn hộ A101" : "VD: Laptop"}
                                                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                                            depositDetailErrors.itemName ? "border-red-500" : "border-slate-600"
                                                        }`}
                                                    />
                                                    {depositDetailErrors.itemName && (
                                                        <p className="mt-1 text-xs text-red-400">{depositDetailErrors.itemName}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-300 mb-1">
                                                        {depositType === "VEHICLE" ? "Biển số" : depositType === "PROPERTY" ? "Số căn hộ/Mã tài sản" : "Mã định danh"}
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={depositDetailIdentifier}
                                                        onChange={(e) => setDepositDetailIdentifier(e.target.value)}
                                                        placeholder={depositType === "VEHICLE" ? "VD: 51A-12345" : depositType === "PROPERTY" ? "VD: A101" : "VD: ITEM-001"}
                                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-300 mb-1">
                                                        Định giá <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        value={depositDetailAmount}
                                                        onChange={(e) => {
                                                            setDepositDetailAmount(e.target.value);
                                                            if (depositDetailErrors.amount) {
                                                                setDepositDetailErrors({ ...depositDetailErrors, amount: "" });
                                                            }
                                                        }}
                                                        min="0"
                                                        step="1000"
                                                        placeholder="Nhập định giá"
                                                        className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                                            depositDetailErrors.amount ? "border-red-500" : "border-slate-600"
                                                        }`}
                                                    />
                                                    {depositDetailErrors.amount && (
                                                        <p className="mt-1 text-xs text-red-400">{depositDetailErrors.amount}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-300 mb-1">Tình trạng</label>
                                                    <select
                                                        value={depositDetailCondition}
                                                        onChange={(e) => setDepositDetailCondition(e.target.value)}
                                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                    >
                                                        <option value="GOOD">Tốt</option>
                                                        <option value="FAIR">Khá</option>
                                                        <option value="POOR">Kém</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs text-gray-300 mb-1">Ghi chú</label>
                                                    <textarea
                                                        value={depositDetailNotes}
                                                        onChange={(e) => setDepositDetailNotes(e.target.value)}
                                                        rows={2}
                                                        placeholder="Ghi chú về tình trạng, đặc điểm..."
                                                        className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">Ghi chú chung</label>
                                            <textarea
                                                value={depositNotes}
                                                onChange={(e) => setDepositNotes(e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            />
                                        </div>

                                        {depositSuccess && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-emerald-400">{depositSuccess}</p>
                                                {createdDeposit && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDepositModal(true)}
                                                        className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm"
                                                    >
                                                        👁 Xem chi tiết phiếu đặt cọc
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {depositError && (
                                            <p className="text-xs text-red-400">{depositError}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={depositSubmitting || Object.keys(depositErrors).length > 0}
                                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded-lg text-sm"
                                        >
                                            {depositSubmitting ? "Đang lưu..." : "Lưu phiếu đặt cọc"}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Handover Form */}
                            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                                <h4 className="text-base font-semibold text-blue-300 mb-3">
                                    Phiếu giao xe
                                    {checkingHandover ? (
                                        <span className="ml-2 text-xs text-slate-400">(Đang kiểm tra...)</span>
                                    ) : hasHandover ? (
                                        <span className="ml-2 text-xs text-emerald-400">(Đã tạo)</span>
                                    ) : !hasDeposit ? (
                                        <span className="ml-2 text-xs text-yellow-400">(Cần có deposit)</span>
                                    ) : null}
                                </h4>
                                
                                {hasHandover ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-emerald-400">
                                            Phiếu giao xe đã được tạo cho booking này.
                                        </p>
                                        {existingHandover && (
                                            <button
                                                type="button"
                                                onClick={() => setShowHandoverModal(true)}
                                                className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm"
                                            >
                                                👁 Xem chi tiết phiếu giao xe
                                            </button>
                                        )}
                                    </div>
                                ) : !hasDeposit ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-yellow-400">
                                            Vui lòng tạo phiếu đặt cọc trước khi tạo phiếu giao xe.
                                        </p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmitHandover} className="space-y-3">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">
                                                    Số km đầu <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    value={handoverOdoStart}
                                                    onChange={(e) => {
                                                        setHandoverOdoStart(e.target.value);
                                                        if (handoverErrors.odoStart) {
                                                            setHandoverErrors({ ...handoverErrors, odoStart: "" });
                                                        }
                                                    }}
                                                    min="0"
                                                    className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                                        handoverErrors.odoStart ? "border-red-500" : "border-slate-600"
                                                    }`}
                                                />
                                                {handoverErrors.odoStart && (
                                                    <p className="mt-1 text-xs text-red-400">{handoverErrors.odoStart}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">
                                                    Mức nhiên liệu (%)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={handoverFuelLevelStart}
                                                    onChange={(e) => {
                                                        setHandoverFuelLevelStart(e.target.value);
                                                        if (handoverErrors.fuelLevelStart) {
                                                            setHandoverErrors({ ...handoverErrors, fuelLevelStart: "" });
                                                        }
                                                    }}
                                                    min="0"
                                                    max="100"
                                                    className={`w-full rounded-lg bg-slate-800 border px-3 py-2 text-sm text-gray-100 ${
                                                        handoverErrors.fuelLevelStart ? "border-red-500" : "border-slate-600"
                                                    }`}
                                                />
                                                {handoverErrors.fuelLevelStart && (
                                                    <p className="mt-1 text-xs text-red-400">{handoverErrors.fuelLevelStart}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">Nơi nhận xe</label>
                                            <input
                                                type="text"
                                                value={handoverPickupPlace}
                                                onChange={(e) => setHandoverPickupPlace(e.target.value)}
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Tình trạng ngoại thất</label>
                                                <select
                                                    value={handoverExteriorStatus}
                                                    onChange={(e) => setHandoverExteriorStatus(e.target.value)}
                                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                >
                                                    <option value="GOOD">Tốt</option>
                                                    <option value="FAIR">Khá</option>
                                                    <option value="POOR">Kém</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-300 mb-1">Tình trạng nội thất</label>
                                                <select
                                                    value={handoverInteriorStatus}
                                                    onChange={(e) => setHandoverInteriorStatus(e.target.value)}
                                                    className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                                >
                                                    <option value="GOOD">Tốt</option>
                                                    <option value="FAIR">Khá</option>
                                                    <option value="POOR">Kém</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">Phụ kiện</label>
                                            <input
                                                type="text"
                                                value={handoverAccessories}
                                                onChange={(e) => setHandoverAccessories(e.target.value)}
                                                placeholder="VD: Chìa khóa, giấy tờ..."
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">Ghi chú hư hỏng</label>
                                            <textarea
                                                value={handoverDamageNote}
                                                onChange={(e) => setHandoverDamageNote(e.target.value)}
                                                rows={2}
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs text-gray-300 mb-1">Người giao xe</label>
                                            <input
                                                type="text"
                                                value={handoverHandedOverBy}
                                                onChange={(e) => setHandoverHandedOverBy(e.target.value)}
                                                className="w-full rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-sm text-gray-100"
                                            />
                                        </div>

                                        {handoverSuccess && (
                                            <div className="space-y-2">
                                                <p className="text-xs text-emerald-400">{handoverSuccess}</p>
                                                {existingHandover && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowHandoverModal(true)}
                                                        className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm"
                                                    >
                                                        👁 Xem chi tiết phiếu giao xe
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {handoverError && (
                                            <p className="text-xs text-red-400">{handoverError}</p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={handoverSubmitting || Object.keys(handoverErrors).length > 0}
                                            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 disabled:cursor-not-allowed text-white rounded-lg text-sm"
                                        >
                                            {handoverSubmitting ? "Đang lưu..." : "Lưu phiếu giao xe"}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Deposit Modal */}
                {showDepositModal && (createdDeposit || existingDeposit) && (
                    <DepositModal
                        deposit={createdDeposit || existingDeposit}
                        onClose={() => setShowDepositModal(false)}
                    />
                )}

                {/* Handover Modal */}
                {showHandoverModal && existingHandover && (
                    <HandoverModal
                        handover={existingHandover}
                        onClose={() => setShowHandoverModal(false)}
                    />
                )}
            </div>
        </div>
    );
}



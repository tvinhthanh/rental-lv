"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
    Calendar, 
    User, 
    CreditCard, 
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2
} from "lucide-react";
import { bookingService } from "@/services/booking.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";

interface BookingWizardProps {
    vehicle: any;
    onClose?: () => void;
    onSuccess?: () => void;
}

type Step = 1 | 2 | 3 | 4;

export default function BookingWizard({ vehicle, onClose, onSuccess }: BookingWizardProps) {
    const router = useRouter();
    const { formatVND } = useFormatVND();
    const { customer, loading: customerLoading } = useCustomer();
    const [currentStep, setCurrentStep] = useState<Step>(1);
    const [formData, setFormData] = useState({
        pickupDate: "",
        returnDate: "",
        pickupBranchId: vehicle?.branchId || "",
        returnBranchId: vehicle?.branchId || "",
        note: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Calculate days and price
    const days = formData.pickupDate && formData.returnDate
        ? Math.ceil(
            (new Date(formData.returnDate).getTime() - new Date(formData.pickupDate).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        : 0;

    const dailyRate = vehicle?.priceList?.dailyRate || vehicle?.overrideDailyRate || 0;
    const baseAmount = days > 0 ? days * dailyRate : 0;
    const discountAmount = 0; // Can add promotion logic here
    const totalAmount = baseAmount - discountAmount;

    // Validation
    const validateStep = (step: Step): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.pickupDate) {
                newErrors.pickupDate = "Vui lòng chọn ngày nhận xe";
            }
            if (!formData.returnDate) {
                newErrors.returnDate = "Vui lòng chọn ngày trả xe";
            }
            if (formData.pickupDate && formData.returnDate) {
                const pickup = new Date(formData.pickupDate);
                const returnDate = new Date(formData.returnDate);
                if (returnDate <= pickup) {
                    newErrors.returnDate = "Ngày trả xe phải sau ngày nhận xe";
                }
            }
            if (!formData.pickupBranchId) {
                newErrors.pickupBranchId = "Vui lòng chọn chi nhánh nhận xe";
            }
        }

        if (step === 2) {
            if (!customer) {
                newErrors.customer = "Vui lòng hoàn thiện thông tin khách hàng";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigation
    const nextStep = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 4) {
                setCurrentStep((prev) => (prev + 1) as Step);
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => (prev - 1) as Step);
        }
    };

    // Create booking mutation
    const createBookingMutation = useMutation({
        mutationFn: async () => {
            if (!customer) {
                throw new Error("Khách hàng chưa được tạo");
            }

            return bookingService.create({
                vehicleId: vehicle.id,
                customerId: customer.id,
                branchId: formData.pickupBranchId,
                returnBranchId: formData.returnBranchId || formData.pickupBranchId,
                pickupDate: new Date(formData.pickupDate).toISOString(),
                returnDate: new Date(formData.returnDate).toISOString(),
                baseAmount,
                discountAmount,
                totalAmount,
                note: formData.note || undefined,
            });
        },
        onSuccess: (data) => {
            toast.success("Đặt xe thành công!");
            if (onSuccess) {
                onSuccess();
            } else {
                router.push(`/user/bookings/${data.id || data.data?.id}`);
            }
            if (onClose) {
                onClose();
            }
        },
        onError: (error: any) => {
            const message = error?.response?.data?.message || error?.message || "Đặt xe thất bại";
            toast.error(message);
        },
    });

    const handleSubmit = () => {
        if (validateStep(3)) {
            createBookingMutation.mutate();
        }
    };

    // Step 1: Date & Branch Selection
    const renderStep1 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Chọn thời gian thuê</h3>
                <p className="text-sm text-slate-400 mb-4">Vui lòng chọn ngày nhận và trả xe</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ngày nhận xe *
                    </label>
                    <input
                        type="date"
                        value={formData.pickupDate}
                        onChange={(e) => {
                            setFormData({ ...formData, pickupDate: e.target.value });
                            setErrors({ ...errors, pickupDate: "" });
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.pickupDate && (
                        <p className="text-red-400 text-xs mt-1">{errors.pickupDate}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ngày trả xe *
                    </label>
                    <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) => {
                            setFormData({ ...formData, returnDate: e.target.value });
                            setErrors({ ...errors, returnDate: "" });
                        }}
                        min={formData.pickupDate || new Date().toISOString().split("T")[0]}
                        className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.returnDate && (
                        <p className="text-red-400 text-xs mt-1">{errors.returnDate}</p>
                    )}
                </div>
            </div>

            {days > 0 && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                    <p className="text-blue-300">
                        <span className="font-semibold">Thời gian thuê:</span> {days} ngày
                    </p>
                    <p className="text-blue-300 mt-1">
                        <span className="font-semibold">Giá/ngày:</span> {formatVND(dailyRate)}
                    </p>
                    <p className="text-blue-300 mt-1">
                        <span className="font-semibold">Tổng tiền:</span> {formatVND(totalAmount)}
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Chi nhánh nhận xe *
                </label>
                <select
                    value={formData.pickupBranchId}
                    onChange={(e) => {
                        setFormData({ ...formData, pickupBranchId: e.target.value });
                        setErrors({ ...errors, pickupBranchId: "" });
                    }}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Chọn chi nhánh</option>
                    {vehicle?.branch && (
                        <option value={vehicle.branch.id}>{vehicle.branch.name}</option>
                    )}
                </select>
                {errors.pickupBranchId && (
                    <p className="text-red-400 text-xs mt-1">{errors.pickupBranchId}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Chi nhánh trả xe (tùy chọn)
                </label>
                <select
                    value={formData.returnBranchId}
                    onChange={(e) => setFormData({ ...formData, returnBranchId: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value={formData.pickupBranchId}>
                        {vehicle?.branch?.name || "Cùng chi nhánh nhận"}
                    </option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Ghi chú (tùy chọn)
                </label>
                <textarea
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    rows={3}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập ghi chú nếu có..."
                />
            </div>
        </div>
    );

    // Step 2: Customer Info
    const renderStep2 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Thông tin khách hàng</h3>
                <p className="text-sm text-slate-400 mb-4">
                    Vui lòng kiểm tra và cập nhật thông tin của bạn
                </p>
            </div>

            {customerLoading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
            ) : customer ? (
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-400">Họ và tên</p>
                            <p className="text-white font-medium">{customer.fullName || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Email</p>
                            <p className="text-white font-medium">{customer.email || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Số điện thoại</p>
                            <p className="text-white font-medium">{customer.phone || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">CMND/CCCD</p>
                            <p className="text-white font-medium">{customer.nationalId || "—"}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Bằng lái xe</p>
                            <p className="text-white font-medium">
                                {customer.driverLicenseNo || "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400">Địa chỉ</p>
                            <p className="text-white font-medium">{customer.address || "—"}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <button
                            onClick={() => router.push("/user/profile")}
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                        >
                            Cập nhật thông tin →
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-6 text-center">
                    <p className="text-yellow-300 mb-4">
                        Bạn chưa có hồ sơ khách hàng. Vui lòng tạo hồ sơ trước khi đặt xe.
                    </p>
                    <button
                        onClick={() => router.push("/user/profile")}
                        className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                    >
                        Tạo hồ sơ khách hàng
                    </button>
                </div>
            )}

            {errors.customer && (
                <p className="text-red-400 text-sm">{errors.customer}</p>
            )}
        </div>
    );

    // Step 3: Review & Confirm
    const renderStep3 = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-2">Xác nhận đặt xe</h3>
                <p className="text-sm text-slate-400 mb-4">Vui lòng kiểm tra lại thông tin</p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
                <div>
                    <h4 className="text-lg font-semibold text-white mb-3">Thông tin xe</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p className="text-slate-400">Tên xe:</p>
                        <p className="text-white font-medium">{vehicle?.name}</p>
                        <p className="text-slate-400">Biển số:</p>
                        <p className="text-white font-medium">{vehicle?.licensePlate || "—"}</p>
                        <p className="text-slate-400">Chi nhánh:</p>
                        <p className="text-white font-medium">{vehicle?.branch?.name || "—"}</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-3">Thời gian thuê</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p className="text-slate-400">Ngày nhận:</p>
                        <p className="text-white font-medium">
                            {formData.pickupDate
                                ? new Date(formData.pickupDate).toLocaleDateString("vi-VN")
                                : "—"}
                        </p>
                        <p className="text-slate-400">Ngày trả:</p>
                        <p className="text-white font-medium">
                            {formData.returnDate
                                ? new Date(formData.returnDate).toLocaleDateString("vi-VN")
                                : "—"}
                        </p>
                        <p className="text-slate-400">Số ngày:</p>
                        <p className="text-white font-medium">{days} ngày</p>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <h4 className="text-lg font-semibold text-white mb-3">Thanh toán</h4>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Giá/ngày:</span>
                            <span className="text-white">{formatVND(dailyRate)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Số ngày:</span>
                            <span className="text-white">{days}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-green-400">
                                <span>Giảm giá:</span>
                                <span>-{formatVND(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-slate-700">
                            <span className="text-lg font-semibold text-white">Tổng tiền:</span>
                            <span className="text-lg font-bold text-blue-400">
                                {formatVND(totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Step 4: Success
    const renderStep4 = () => (
        <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Đặt xe thành công!</h3>
            <p className="text-slate-400 mb-6">
                Chúng tôi sẽ liên hệ với bạn để xác nhận đặt xe.
            </p>
            <button
                onClick={() => {
                    if (onClose) onClose();
                    router.push("/user/bookings");
                }}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
                Xem đơn đặt xe
            </button>
        </div>
    );

    const steps = [
        { number: 1, title: "Thời gian", icon: Calendar },
        { number: 2, title: "Thông tin", icon: User },
        { number: 3, title: "Xác nhận", icon: CheckCircle2 },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Đặt xe</h2>
                        <p className="text-sm text-slate-400 mt-1">{vehicle?.name}</p>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
                        >
                            ×
                        </button>
                    )}
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-slate-700">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.number;
                            const isCompleted = currentStep > step.number;

                            return (
                                <div key={step.number} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                                isCompleted
                                                    ? "bg-green-600 border-green-600 text-white"
                                                    : isActive
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "bg-slate-800 border-slate-700 text-slate-400"
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Icon className="w-5 h-5" />
                                            )}
                                        </div>
                                        <p
                                            className={`text-xs mt-2 ${
                                                isActive || isCompleted
                                                    ? "text-white"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {step.title}
                                        </p>
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`h-0.5 flex-1 mx-2 ${
                                                isCompleted ? "bg-green-600" : "bg-slate-700"
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </div>

                {/* Footer */}
                {currentStep < 4 && (
                    <div className="flex items-center justify-between p-6 border-t border-slate-700">
                        <button
                            onClick={currentStep > 1 ? prevStep : onClose}
                            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {currentStep > 1 ? "Quay lại" : "Hủy"}
                        </button>

                        {currentStep === 3 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={createBookingMutation.isPending}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {createBookingMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        Xác nhận đặt xe
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Tiếp theo
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

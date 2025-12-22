"use client";

import { useEffect, useState } from "react";
import { notFound, useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { vehicleService } from "@/services/vehicle.service";
import { reviewService } from "@/services/review.service";
import { customerService } from "@/services/customer.service";
import { documentService } from "@/services/document.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { useCustomer } from "@/hooks/useCustomer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toWebP, getImageLoading } from "@/lib/image-utils";

export default function CarDetailPage() {
    const { slug } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [documentsLoading, setDocumentsLoading] = useState(false);
    const { formatVND } = useFormatVND();
    const router = useRouter();
    const { customer, loading: customerLoading } = useCustomer();
    const { data: user } = useCurrentUser();
    const queryClient = useQueryClient();

    // ⚡ Mutation để tạo customer - PHẢI ĐẶT TRƯỚC MỌI EARLY RETURN
    const createCustomerMutation = useMutation({
        mutationFn: async (formData: any) => {
            return customerService.create({
                ...formData,
                userId: user?.id,
            });
        },
        onSuccess: () => {
            toast.success("Tạo hồ sơ khách hàng thành công!");
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["current-user"] });
            setShowCreateModal(false);
            // Reload page để refresh customer
            window.location.reload();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Tạo hồ sơ thất bại";
            toast.error(msg);
        },
    });

    useEffect(() => {
        if (!slug) return;

        vehicleService.getBySlug(slug as string).then((res) => {
            if (!res) return notFound();

            // 🟦 Normalize mọi dạng response
            let data = res;

            if (res?.items && Array.isArray(res.items)) {
                data = res.items[0] || null;
            }

            if (res?.data) {
                data = res.data;
            }

            if (!data) return notFound();

            setVehicle(data);
            
            // Load documents for this vehicle
            setDocumentsLoading(true);
            documentService.list({ vehicleId: data.id })
                .then((docRes) => {
                    const items = Array.isArray(docRes?.items) ? docRes.items : Array.isArray(docRes) ? docRes : [];
                    setDocuments(items);
                })
                .catch((err) => {
                    console.error("Load documents failed:", err);
                })
                .finally(() => setDocumentsLoading(false));
            
            // Load reviews for this vehicle
            setReviewLoading(true);
            reviewService
                .list({ vehicleId: data.id, limit: 20 })
                .then((revRes) => {
                    const items = Array.isArray(revRes?.items) ? revRes.items : Array.isArray(revRes) ? revRes : [];
                    setReviews(items);
                })
                .catch((err) => {
                    console.error("Load reviews failed:", err);
                    setReviewError(err?.message || "Không thể tải đánh giá");
                })
                .finally(() => setReviewLoading(false));
        });
    }, [slug]);

    if (!vehicle) {
        return (
            <div className="p-10 text-center text-gray-400">
                Đang tải thông tin xe...
            </div>
        );
    }

    // ⚡ Kiểm tra user có customer chưa
    const isCustomerRole = user?.role === "CUSTOMER" || user?.role === "USER";
    const hasCustomer = !!customer;

    const price =
        vehicle?.priceList?.dailyRate
        ? formatVND(vehicle.priceList.dailyRate) + " / ngày"
        : "—";

    const avgRating =
        vehicle?.rating ||
        (reviews.length
            ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
            : 0);

    return (
        <>
            {/* MAIN VEHICLE SECTION */}
            <div className="max-w-6xl mx-auto p-6 text-gray-800 dark:text-gray-200">
                <div className="grid md:grid-cols-2 gap-10">
                    {/* IMAGE SECTION */}
                    <div>
                        <img
                            src={toWebP(vehicle.photos?.[0])}
                            alt={vehicle.name}
                            className="w-full h-[420px] object-cover rounded-xl shadow"
                            loading={getImageLoading(true)}
                            decoding="async"
                        />

                        {Array.isArray(vehicle.photos) && vehicle.photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-3 mt-4">
                                {vehicle.photos.slice(1).map((p: string, idx: number) => (
                                    <img
                                        key={idx}
                                        src={toWebP(p)}
                                        alt={vehicle.name}
                                        className="h-24 w-full object-cover rounded-lg shadow"
                                        loading={getImageLoading(false)}
                                        decoding="async"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* INFO SECTION */}
                    <div>
                        <h1 className="text-3xl font-bold mb-3 bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                            {vehicle.name}
                        </h1>

                        <p className="text-2xl text-blue-600 font-semibold mb-6">{price}</p>

                        <div className="space-y-3 text-sm">
                            <p>
                                <span className="font-semibold">Biển số:</span> {vehicle.licensePlate}
                            </p>

                            {/* 🟩 FIX brand = object */}
                            <p>
                                <span className="font-semibold">Hãng xe:</span>{" "}
                                {vehicle.brand?.name ?? "—"}
                            </p>

                            <p>
                                <span className="font-semibold">Mẫu xe:</span> {vehicle.model ?? "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Năm sản xuất:</span>{" "}
                                {vehicle.year ?? "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Màu sắc:</span>{" "}
                                {vehicle.color ?? "—"}
                            </p>

                            <p>
                                <span className="font-semibold">Danh mục:</span>{" "}
                                {vehicle.category?.name ?? "—"}
                            </p>
                            <p>
                                <span className="font-semibold">Chi nhánh:</span>{" "}
                                {vehicle.branch?.name ?? "—"}
                            </p>

                            <p>
                                <span className="font-semibold">Tình trạng:</span>{" "}
                                {vehicle.status === "AVAILABLE" && "Sẵn sàng"}
                                {vehicle.status === "MAINTENANCE" && "Bảo dưỡng"}
                                {vehicle.status === "UNAVAILABLE" && "Không khả dụng"}
                            </p>
                        </div>

                        {/* ⚡ Kiểm tra và hiển thị nút phù hợp */}
                        {!customerLoading && isCustomerRole && !hasCustomer ? (
                            <button
                                className="mt-8 px-6 py-3 bg-yellow-600 text-white text-lg rounded-lg hover:bg-yellow-700"
                                onClick={() => setShowCreateModal(true)}
                            >
                                Tạo hồ sơ khách hàng để thuê xe
                            </button>
                        ) : (
                            <button
                                className="mt-8 px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => router.push(`/user/bookings/${vehicle.slug}`)}
                                disabled={customerLoading || !hasCustomer}
                            >
                                {customerLoading
                                    ? "Đang tải..."
                                    : hasCustomer
                                        ? "Thuê ngay"
                                        : "Vui lòng tạo hồ sơ"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DOCUMENTS SECTION */}
            <div className="max-w-6xl mx-auto px-6 pb-6">
                <div className="mt-10 rounded-2xl bg-gray-900/60 border border-white/10 p-6 shadow-lg">
                    <div className="mb-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200 mb-2">
                            Giấy tờ xe
                        </p>
                        <h2 className="text-2xl font-bold text-white">
                            Tài liệu và giấy tờ của xe
                        </h2>
                        <p className="text-sm text-blue-100 mt-1">
                            Xem các giấy tờ quan trọng của xe như đăng kiểm, bảo hiểm, v.v.
                        </p>
                    </div>

                    {documentsLoading ? (
                        <div className="text-blue-100">Đang tải giấy tờ...</div>
                    ) : documents.length === 0 ? (
                        <div className="text-blue-100">
                            Chưa có giấy tờ nào được upload cho xe này.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => {
                                const docTypeMap: Record<string, string> = {
                                    'REGISTRATION': 'Đăng kiểm',
                                    'INSURANCE': 'Bảo hiểm',
                                    'OWNERSHIP': 'Giấy chủ quyền',
                                    'INSPECTION': 'Kiểm định',
                                    'OTHER': 'Khác'
                                };
                                
                                const isExpired = doc.expiresAt && new Date(doc.expiresAt) < new Date();
                                
                                return (
                                    <div
                                        key={doc.id}
                                        className={`p-4 rounded-xl border ${
                                            isExpired 
                                                ? 'border-red-500/50 bg-red-900/20' 
                                                : 'border-white/10 bg-white/5'
                                        } shadow`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-white">
                                                {docTypeMap[doc.docType] || doc.docType}
                                            </h3>
                                            {isExpired && (
                                                <span className="px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                                    Hết hạn
                                                </span>
                                            )}
                                        </div>
                                        
                                        {doc.description && (
                                            <p className="text-sm text-blue-100 mb-2">
                                                {doc.description}
                                            </p>
                                        )}
                                        
                                        {doc.expiresAt && (
                                            <p className={`text-xs mb-2 ${
                                                isExpired ? 'text-red-300' : 'text-blue-200'
                                            }`}>
                                                Hết hạn: {new Date(doc.expiresAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                        
                                        {doc.issuedAt && (
                                            <p className="text-xs text-blue-200 mb-2">
                                                Ngày cấp: {new Date(doc.issuedAt).toLocaleDateString('vi-VN')}
                                            </p>
                                        )}
                                        
                                        {doc.fileUrl && (
                                            <a
                                                href={doc.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-blue-400 hover:text-blue-300 underline"
                                            >
                                                Xem tài liệu →
                                            </a>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* REVIEW SECTION */}
            <div className="max-w-6xl mx-auto px-6 pb-12">
                <div className="mt-10 rounded-2xl bg-gray-900/60 border border-white/10 p-6 shadow-lg">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.2em] text-blue-200">
                                Đánh giá sau hoàn tất booking
                            </p>
                            <h2 className="text-2xl font-bold text-white">
                                Trải nghiệm từ khách thuê
                            </h2>
                            <p className="text-sm text-blue-100">
                                Chỉ hiển thị các đánh giá từ đơn đã hoàn thành/đã trả xe, giúp bạn
                                tham khảo nhanh.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-white">
                            <div className="flex items-center gap-1 text-yellow-400">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i <= Math.round(avgRating)
                                            ? "fill-yellow-400"
                                            : "text-gray-500"
                                            }`}
                                    />
                                ))}
                            </div>
                            <div className="text-sm leading-tight text-right">
                                <div className="font-semibold">{avgRating.toFixed(1)}/5</div>
                                <div className="text-blue-100 text-xs">
                                    {vehicle?.reviewCount || reviews.length || 0} lượt đánh giá
                                </div>
                            </div>
                        </div>
                    </div>

                    {reviewLoading ? (
                        <div className="text-blue-100">Đang tải đánh giá...</div>
                    ) : reviewError ? (
                        <div className="text-rose-300">{reviewError}</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-blue-100">
                            Chưa có đánh giá nào cho xe này.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reviews.map((rev) => (
                                <div
                                    key={rev.id}
                                    className="p-4 rounded-xl border border-white/10 bg-white/5 shadow"
                                >
                                    <div className="flex items-center gap-2 text-yellow-400 mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < rev.rating
                                                    ? "fill-yellow-400"
                                                    : "text-gray-500"
                                                    }`}
                                            />
                                        ))}
                                        <span className="text-sm text-blue-100">
                                            {rev.rating}/5
                                        </span>
                                    </div>
                                    <p className="text-white font-semibold mb-1">
                                        {rev.customer?.fullName || "Khách thuê"}
                                    </p>
                                    <p className="text-blue-100 text-sm mb-3">
                                        {rev.comment || "Không có nhận xét"}
                                    </p>
                                    <div className="text-xs text-blue-200 flex flex-wrap gap-2">
                                        {rev.booking?.bookingCode && (
                                            <span className="px-2 py-1 bg-white/10 rounded-full">
                                                Mã booking: {rev.booking.bookingCode}
                                            </span>
                                        )}
                                        <span className="px-2 py-1 bg-white/10 rounded-full">
                                            Ngày:{" "}
                                            {rev.createdAt
                                                ? new Date(rev.createdAt).toLocaleDateString(
                                                    "vi-VN"
                                                )
                                                : "—"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ⚡ Modal tạo customer */}
            {showCreateModal && (
                <CreateCustomerModal
                    user={user}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={(formData: any) => createCustomerMutation.mutate(formData)}
                    isLoading={createCustomerMutation.isPending}
                />
            )}
        </>
    );
}

// ⚡ Component Modal tạo customer
function CreateCustomerModal({ user, onClose, onSubmit, isLoading }: any) {
    const [form, setForm] = useState({
        fullName: user?.name || "",
        phone: "",
        email: user?.email || "",
        address: "",
        driverLicenseNo: "",
        driverLicenseExpiry: "",
        nationalId: "",
        nationality: "",
    });

    const handleSubmit = () => {
        if (!form.fullName || !form.phone) {
            toast.error("Vui lòng điền họ tên và số điện thoại");
            return;
        }
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 p-6 w-full max-w-[520px] rounded-2xl shadow-xl text-gray-900 dark:text-gray-100 max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Tạo hồ sơ khách hàng
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Vui lòng điền thông tin để có thể thuê xe
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Họ tên *"
                        value={form.fullName}
                        onChange={(v: string) => setForm({ ...form, fullName: v })}
                    />
                    <Input
                        label="Số điện thoại *"
                        value={form.phone}
                        onChange={(v: string) => setForm({ ...form, phone: v })}
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(v: string) => setForm({ ...form, email: v })}
                    />
                    <Input
                        label="Địa chỉ"
                        value={form.address}
                        onChange={(v: string) => setForm({ ...form, address: v })}
                    />
                    <Input
                        label="CMND/CCCD"
                        value={form.nationalId}
                        onChange={(v: string) => setForm({ ...form, nationalId: v })}
                    />
                    <Input
                        label="Quốc tịch"
                        value={form.nationality}
                        onChange={(v: string) => setForm({ ...form, nationality: v })}
                    />
                    <Input
                        label="Số GPLX"
                        value={form.driverLicenseNo}
                        onChange={(v: string) =>
                            setForm({ ...form, driverLicenseNo: v })
                        }
                    />
                    <Input
                        label="GPLX hết hạn"
                        type="date"
                        value={form.driverLicenseExpiry}
                        onChange={(v: string) =>
                            setForm({ ...form, driverLicenseExpiry: v })
                        }
                    />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-60"
                    >
                        {isLoading ? "Đang tạo..." : "Tạo hồ sơ"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Input({ label, value, onChange, type = "text" }: any) {
    return (
        <div>
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                {label}
            </label>
            <input
                type={type}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { toWebP, getImageLoading } from "@/lib/image-utils";
import { notFound, useParams, useRouter } from "next/navigation";
import { useCustomer } from "@/hooks/useCustomer";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function CarDetailPage() {
    const { slug } = useParams();
    const [vehicle, setVehicle] = useState<any>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
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

    const price = vehicle?.priceList?.dailyRate
        ? formatVND(vehicle.priceList.dailyRate) + " / ngày"
        : "—";

    return (
        <>
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
                        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{vehicle.name}</h1>

                        <p className="text-2xl text-blue-600 font-semibold mb-6">{price}</p>

                        <div className="space-y-3 text-sm">
                            <p><span className="font-semibold">Biển số:</span> {vehicle.licensePlate}</p>

                            {/* 🟩 FIX brand = object */}
                            <p><span className="font-semibold">Hãng xe:</span> {vehicle.brand?.name ?? "—"}</p>

                            <p><span className="font-semibold">Mẫu xe:</span> {vehicle.model ?? "—"}</p>
                            <p><span className="font-semibold">Năm sản xuất:</span> {vehicle.year ?? "—"}</p>
                            <p><span className="font-semibold">Màu sắc:</span> {vehicle.color ?? "—"}</p>

                            <p><span className="font-semibold">Danh mục:</span> {vehicle.category?.name ?? "—"}</p>
                            <p><span className="font-semibold">Chi nhánh:</span> {vehicle.branch?.name ?? "—"}</p>

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
                                {customerLoading ? "Đang tải..." : hasCustomer ? "Thuê ngay" : "Vui lòng tạo hồ sơ"}
                            </button>
                        )}
                    </div>
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
                        onChange={(v: string) => setForm({ ...form, driverLicenseNo: v })}
                    />
                    <Input
                        label="GPLX hết hạn"
                        type="date"
                        value={form.driverLicenseExpiry}
                        onChange={(v: string) => setForm({ ...form, driverLicenseExpiry: v })}
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
            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">{label}</label>
            <input
                type={type}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}

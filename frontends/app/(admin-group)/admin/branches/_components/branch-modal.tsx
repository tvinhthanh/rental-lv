"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { branchService } from "@/services/branch.service";
import { useFormSubmit } from "@/hooks/useHooks";
import dynamic from "next/dynamic";

const MapPicker = dynamic(() => import("@/components/add-ons/map-picker"), {
    ssr: false,
    loading: () => <p>Đang tải bản đồ...</p>,
});

interface BranchModalProps {
    open: boolean;
    selected?: any;
    onClose: () => void;
}

export default function BranchModal({ open, selected, onClose }: BranchModalProps) {
    const [openMap, setOpenMap] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const defaultValues = selected ?? {
        name: "",
        code: "",
        slug: "",
        address: "",
        city: "",
        country: "",
        phone: "",
        email: "",
        latitude: "",
        longitude: "",
        googleMapUrl: "",
        businessHours: "",
        metaTitle: "",
        metaDescription: "",
        isActive: true,
    };

    const { register, setValue, handleSubmit: formHandle } = useForm({
        defaultValues,
    });

    // AUTO-SLUG
    const generateSlug = (name: string) =>
        name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

    const validate = (data: any) => {
        const errs: Record<string, string> = {};
        if (!data.name || data.name.trim().length < 2) errs.name = "Tên chi nhánh tối thiểu 2 ký tự";
        if (data.code && !/^[A-Z0-9-]+$/.test(data.code.trim())) errs.code = "Code chỉ gồm chữ in hoa, số, dấu gạch";
        if (!data.slug || !/^[a-z0-9-]+$/.test(data.slug)) errs.slug = "Slug chỉ gồm chữ thường, số và dấu gạch";
        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errs.email = "Email không hợp lệ";
        if (data.phone && !/^0\d{9}$/.test(data.phone.trim())) errs.phone = "Số điện thoại phải 10 số và bắt đầu bằng 0";
        if (data.latitude !== "" && data.latitude !== undefined && data.latitude !== null) {
            const lat = Number(data.latitude);
            if (Number.isNaN(lat) || lat < -90 || lat > 90) errs.latitude = "Vĩ độ từ -90 đến 90";
        }
        if (data.longitude !== "" && data.longitude !== undefined && data.longitude !== null) {
            const lng = Number(data.longitude);
            if (Number.isNaN(lng) || lng < -180 || lng > 180) errs.longitude = "Kinh độ từ -180 đến 180";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const { handleSubmit, isPending } = useFormSubmit(
        (formData: any) => {
            const data = {
                ...formData,
                latitude: formData.latitude !== "" && formData.latitude !== undefined ? Number(formData.latitude) : undefined,
                longitude: formData.longitude !== "" && formData.longitude !== undefined ? Number(formData.longitude) : undefined,
                slug: formData.slug || generateSlug(formData.name)
            };

            return selected
                ? branchService.update(selected.id, data)
                : branchService.create(data);
        },
        ["branches"]
    );

    const onSubmit = async (data: any) => {
        const clean = { ...data };

        // Loại bỏ field không được update
        [
            "id",
            "createdAt",
            "updatedAt",
            "vehicles",
            "employees",
            "bookings",
            "returnBranchBookings",
            "returnReportBranches"
        ].forEach(field => delete clean[field]);

        // Convert lại số
        clean.latitude = clean.latitude !== "" && clean.latitude !== undefined ? Number(clean.latitude) : undefined;
        clean.longitude = clean.longitude !== "" && clean.longitude !== undefined ? Number(clean.longitude) : undefined;

        clean.slug = clean.slug || generateSlug(clean.name);
        clean.code = clean.code ? clean.code.toUpperCase() : undefined;
        clean.email = clean.email?.trim() || undefined;
        clean.phone = clean.phone?.trim() || undefined;

        if (!validate(clean)) return;

        await handleSubmit(clean);
        onClose();
    };


    if (!open) return null;

    return (
        <>
            {/* MAIN MODAL */}
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-slate-900 border border-slate-700 p-6 w-[420px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">

                    <h2 className="text-xl font-semibold mb-4 text-gray-200">
                        {selected ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh"}
                    </h2>

                    <form onSubmit={formHandle(onSubmit)} className="space-y-3">

                        {/* BASIC */}
                        <input
                            {...register("name")}
                            className="input-dark"
                            placeholder="Tên chi nhánh *"
                            required
                            onBlur={(e) => setValue("slug", generateSlug(e.target.value))}
                        />
                        {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}

                        <input {...register("code")} className="input-dark" placeholder="Mã chi nhánh (không bắt buộc)" />
                        {errors.code && <p className="text-xs text-rose-400 mt-1">{errors.code}</p>}
                        <input {...register("slug")} className="input-dark" placeholder="Slug" />
                        {errors.slug && <p className="text-xs text-rose-400 mt-1">{errors.slug}</p>}

                        <input {...register("email")} className="input-dark" placeholder="Địa chỉ Email" />
                        {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                        <input {...register("address")} className="input-dark" placeholder="Địa chỉ" />
                        <input {...register("city")} className="input-dark" placeholder="Thành phố" />
                        <input {...register("country")} className="input-dark" placeholder="Quốc gia" />
                        <input {...register("phone")} className="input-dark" placeholder="Số điện thoại" />
                        {errors.phone && <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>}

                        {/* MAP PICKER */}
                        <div className="grid grid-cols-2 gap-3">
                            <input {...register("latitude")} className="input-dark" placeholder="Vĩ độ" />
                            <input {...register("longitude")} className="input-dark" placeholder="Kinh độ" />
                            {errors.latitude && <p className="text-xs text-rose-400 mt-1 col-span-2">{errors.latitude}</p>}
                            {errors.longitude && !errors.latitude && <p className="text-xs text-rose-400 mt-1 col-span-2">{errors.longitude}</p>}
                        </div>

                        <button
                            type="button"
                            onClick={() => setOpenMap(true)}
                            className="w-full py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                        >
                            <MapPin className="w-4 h-4" />
                            Chọn vị trí trên bản đồ
                        </button>

                        <input {...register("googleMapUrl")} className="input-dark" placeholder="Google Map URL" />
                        <input {...register("businessHours")} className="input-dark" placeholder="Giờ mở cửa (VD: 08:00 - 17:00)" />

                        <input {...register("metaTitle")} className="input-dark" placeholder="Tiêu đề SEO" />
                        <textarea {...register("metaDescription")} className="input-dark" placeholder="Mô tả SEO" />

                        <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                            <input type="checkbox" {...register("isActive")} />
                            Hoạt động
                        </label>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700 transition-colors"
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50 transition-colors"
                            >
                                {isPending ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>

                    </form>
                </div>
            </div>

            {/* MAP PICKER POPUP */}
            {openMap && (
                <MapPicker
                    onSelect={({ lat, lng }: any) => {
                        setValue("latitude", lat);
                        setValue("longitude", lng);
                        setValue("googleMapUrl", `https://www.google.com/maps?q=${lat},${lng}`);
                        setOpenMap(false);
                    }}
                    onClose={() => setOpenMap(false)}
                />
            )}
        </>
    );
}

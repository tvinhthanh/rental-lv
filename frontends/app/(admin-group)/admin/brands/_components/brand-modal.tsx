"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { brandService } from "@/services/brand.service";
import { useFormSubmit } from "@/hooks/useHooks";
import ImageUpload from "@/components/upload/image-upload";

export default function BrandModal({ open, selected, onClose }: any) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const defaultValues = selected ?? {
        name: "",
        slug: "",
        description: "",
        country: "",
        websiteUrl: "",
        logoUrl: "",
        sortOrder: 0,
        isFeatured: false,
        metaTitle: "",
        metaDescription: "",
        isActive: true,
    };

    const { register, setValue, handleSubmit: formHandle, reset, watch } = useForm({
        defaultValues,
    });

    const logoUrl = watch("logoUrl");

    useEffect(() => {
        if (selected) {
            const values = {
                name: selected.name || "",
                slug: selected.slug || "",
                description: selected.description || "",
                country: selected.country || "",
                websiteUrl: selected.websiteUrl || "",
                logoUrl: selected.logoUrl || "",
                sortOrder: selected.sortOrder || 0,
                isFeatured: selected.isFeatured || false,
                metaTitle: selected.metaTitle || "",
                metaDescription: selected.metaDescription || "",
                isActive: selected.isActive !== undefined ? selected.isActive : true,
            };
            reset(values);
            setLogoPreview(values.logoUrl || null);
        } else {
            reset(defaultValues);
            setLogoPreview(null);
        }
    }, [selected, reset]);

    const generateSlug = (name: string) =>
        name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");

    const { handleSubmit, isPending } = useFormSubmit(
        (formData: any) => {
            const data = {
                ...formData,
                sortOrder: Number(formData.sortOrder) || 0,
                slug: formData.slug || generateSlug(formData.name),
            };

            return selected
                ? brandService.update(selected.id, data)
                : brandService.create(data);
        },
        ["brands"]
    );

    const onSubmit = async (data: any) => {
        const clean = { ...data };

        ["id", "createdAt", "updatedAt", "vehicles"].forEach((f) => delete clean[f]);

        clean.sortOrder = Number(clean.sortOrder) || 0;

        if (!selected) {
            clean.slug = clean.slug || generateSlug(clean.name);
        }

        await handleSubmit(clean);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="mb-6 pb-4 border-b border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white">
                            {selected ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu"}
                </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {selected ? "Cập nhật thông tin thương hiệu" : "Thêm thương hiệu mới vào hệ thống"}
                        </p>
                    </div>

                    <form onSubmit={formHandle(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    Tên thương hiệu *
                                </label>
                    <input
                        {...register("name")}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-500"
                                    placeholder="Nhập tên thương hiệu"
                        required
                        onBlur={(e) => {
                            if (!selected) {
                                setValue("slug", generateSlug(e.target.value));
                            }
                        }}
                    />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    Slug
                                </label>
                    <input
                        {...register("slug")}
                                    className="w-full px-4 py-2.5 bg-slate-800/30 border border-slate-700 text-slate-400 rounded-lg focus:outline-none placeholder:text-slate-600"
                                    placeholder="slug-tu-dong"
                        readOnly={false}
                    />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Mô tả
                            </label>
                    <textarea
                        {...register("description")}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-500 min-h-[80px]"
                                placeholder="Mô tả về thương hiệu"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    Quốc gia
                                </label>
                                <input
                                    {...register("country")}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-500"
                                    placeholder="Việt Nam"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                    Thứ tự sắp xếp
                                </label>
                                <input
                                    type="number"
                                    {...register("sortOrder")}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-500"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">
                                Website
                            </label>
                    <input
                        {...register("websiteUrl")}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder:text-slate-500"
                                placeholder="https://example.com"
                    />
                        </div>

                        <div>
                            <ImageUpload
                                value={logoPreview || ""}
                                onChange={(url) => {
                                    setValue("logoUrl", url);
                                    setLogoPreview(url);
                                }}
                                label="Logo"
                                placeholder="Nhập URL hoặc tải ảnh lên"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                                <input type="checkbox" {...register("isFeatured")} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                                <span className="text-sm text-gray-300">Thương hiệu nổi bật</span>
                    </label>
                            <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                                <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" defaultChecked />
                                <span className="text-sm text-gray-300">Kích hoạt</span>
                    </label>
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 mt-6">
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800/50 transition-colors font-medium"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl"
                                >
                                    {isPending ? "Đang lưu..." : "Lưu"}
                                </button>
                            </div>
                        </div>
                </form>
                </div>
            </div>
        </div>
    );
}

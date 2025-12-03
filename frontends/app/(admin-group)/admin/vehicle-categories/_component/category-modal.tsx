"use client";

import { useForm } from "react-hook-form";
import { useFormSubmit } from "@/hooks/useHooks";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { useEffect } from "react";

interface CategoryModalProps {
    open: boolean;
    selected?: any;
    onClose: () => void;
}

export default function CategoryModal({ open, selected, onClose }: CategoryModalProps) {
    const defaultValues = selected ?? {
        name: "",
        code: "",
        slug: "",
        description: "",
        imageUrl: "",
        metaTitle: "",
        metaDescription: "",
        seoTitle: "",
        hTitle: "",
        displayOrder: 0,
        isActive: true
    };

    const { register, watch, setValue, handleSubmit: formHandle } = useForm({ defaultValues });

    const nameWatch = watch("name");
    const imageUrl = watch("imageUrl");

    useEffect(() => {
        if (!selected && nameWatch) {
            const slug = nameWatch
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "");
            setValue("slug", slug);
        }
    }, [nameWatch, selected, setValue]);

    const { handleSubmit, isPending } = useFormSubmit(
        (data: any) => {
            const payload = {
                ...data,
                displayOrder: data.displayOrder === "" ? 0 : Number(data.displayOrder)
            };

            return selected
                ? vehicleCategoryService.update(selected.id, payload)
                : vehicleCategoryService.create(payload);
        },
        ["vehicle-categories"]
    );

    const onSubmit = async (data: any) => {
        await handleSubmit(data);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-[550px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="mb-6 pb-4 border-b border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white">
                            {selected ? "Chỉnh sửa Danh mục" : "Thêm Danh mục"}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {selected ? "Cập nhật thông tin danh mục" : "Thêm danh mục mới vào hệ thống"}
                        </p>
                    </div>

                    <form onSubmit={formHandle(onSubmit)} className="space-y-4">

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Tên danh mục *</label>
                                <input 
                                    {...register("name")} 
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500" 
                                    placeholder="Tên danh mục" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Mã</label>
                                <input 
                                    {...register("code")} 
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500" 
                                    placeholder="CODE" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Slug</label>
                                <input 
                                    {...register("slug")} 
                                    className="w-full px-4 py-2.5 bg-slate-800/30 border border-slate-700 text-slate-400 rounded-lg focus:outline-none placeholder:text-slate-600" 
                                    placeholder="slug-tu-dong" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Thứ tự</label>
                                <input 
                                    {...register("displayOrder")} 
                                    type="number" 
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500" 
                                    placeholder="0" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Mô tả</label>
                            <textarea 
                                {...register("description")} 
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500 min-h-[80px]" 
                                placeholder="Mô tả ngắn về danh mục" 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Hình ảnh</label>
                            <div className="border border-slate-700/80 rounded-xl p-4 bg-slate-800/30 space-y-3">
                                <input
                                    {...register("imageUrl")}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder:text-slate-500"
                                    placeholder="https://..."
                                />
                                {imageUrl && (
                                    <div className="h-32 rounded-lg border border-slate-700 bg-slate-900/80 flex items-center justify-center overflow-hidden">
                                        <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors">
                            <input type="checkbox" {...register("isActive")} className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500" defaultChecked />
                            <span className="text-sm text-gray-300">Kích hoạt</span>
                        </label>

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
                                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 transition-all font-semibold shadow-lg hover:shadow-xl"
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

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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[520px] rounded-lg shadow-xl">

                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    {selected ? "Edit Category" : "Add Category"}
                </h2>

                <form onSubmit={formHandle(onSubmit)} className="space-y-4">

                    <div className="grid grid-cols-2 gap-3">
                        <input {...register("name")} className="input-dark focus:bg-white focus:text-black" placeholder="Name *" required />
                        <input {...register("code")} className="input-dark focus:bg-white focus:text-black" placeholder="Code" />
                        <input {...register("slug")} className="input-dark focus:bg-white focus:text-black" placeholder="Slug" />
                        <input {...register("displayOrder")} type="number" className="input-dark focus:bg-white focus:text-black" placeholder="Display Order" />
                    </div>

                    <textarea {...register("description")} className="input-dark h-20 focus:bg-white focus:text-black" placeholder="Short description" />

                    <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/40">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-300">Image (used on category listing cards)</p>
                            {imageUrl && (
                                <span className="text-xs text-gray-400 truncate max-w-[180px]">{imageUrl}</span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 items-start">
                            <input
                                {...register("imageUrl")}
                                className="input-dark focus:bg-white focus:text-black"
                                placeholder="https://..."
                            />
                            <div className="h-24 rounded border border-slate-700 bg-slate-900/80 flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-gray-500">Preview will show here</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input {...register("metaTitle")} className="input-dark focus:bg-white focus:text-black" placeholder="Meta Title" />
                        <input {...register("seoTitle")} className="input-dark focus:bg-white focus:text-black" placeholder="SEO Title" />
                        <textarea {...register("metaDescription")} className="input-dark h-20 focus:bg-white focus:text-black" placeholder="Meta Description" />
                        <input {...register("hTitle")} className="input-dark focus:bg-white focus:text-black" placeholder="Heading Title (H1)" />
                    </div>

                    <label className="flex items-center gap-2 text-gray-300">
                        <input type="checkbox" {...register("isActive")} />
                        Active
                    </label>

                    <div className="flex justify-end gap-3 pt-3">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700">
                            Cancel
                        </button>

                        <button type="submit" disabled={isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50">
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>

                </form>

            </div>
        </div>
    );
}

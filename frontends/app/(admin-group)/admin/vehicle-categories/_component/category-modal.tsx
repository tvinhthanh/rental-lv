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
        isActive: true
    };

    const { register, watch, setValue, handleSubmit: formHandle } = useForm({ defaultValues });

    const nameWatch = watch("name");

    useEffect(() => {
        if (!selected && nameWatch) {
            const slug = nameWatch
                .toLowerCase()
                .trim()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9\-]/g, "");
            setValue("slug", slug);
        }
    }, [nameWatch]);

    const { handleSubmit, isPending } = useFormSubmit(
        (data: any) =>
            selected
                ? vehicleCategoryService.update(selected.id, data)
                : vehicleCategoryService.create(data),
        ["vehicle-categories"]
    );

    const onSubmit = async (data: any) => {
        await handleSubmit(data);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[420px] rounded-lg shadow-xl">

                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    {selected ? "Edit Category" : "Add Category"}
                </h2>

                <form onSubmit={formHandle(onSubmit)} className="space-y-3">

                    <input {...register("name")} className="input-dark" placeholder="Name *" required />
                    <input {...register("code")} className="input-dark" placeholder="Code" />
                    <input {...register("slug")} className="input-dark" placeholder="Slug" />

                    <textarea {...register("description")} className="input-dark h-24" placeholder="Description" />

                    <input {...register("imageUrl")} className="input-dark" placeholder="Image URL" />
                    <input {...register("metaTitle")} className="input-dark" placeholder="Meta Title" />
                    <textarea {...register("metaDescription")} className="input-dark" placeholder="Meta Description" />

                    <input {...register("seoTitle")} className="input-dark" placeholder="SEO Title" />
                    <input {...register("hTitle")} className="input-dark" placeholder="Heading Title (H1)" />

                    {/* <input {...register("displayOrder")} type="number" className="input-dark" placeholder="Display Order" /> */}

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

"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { brandService } from "@/services/brand.service";
import { useFormSubmit } from "@/hooks/useHooks";

export default function BrandModal({ open, selected, onClose }: any) {
    const [logoPreview, setLogoPreview] = useState(null);

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

    const { register, setValue, handleSubmit: formHandle, reset } = useForm({
        defaultValues,
    });

    useEffect(() => {
        reset(defaultValues);
        setLogoPreview(defaultValues.logoUrl || null);
    }, [selected]);

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

        // giữ slug gốc khi edit
        if (!selected) {
            clean.slug = clean.slug || generateSlug(clean.name);
        }

        await handleSubmit(clean);
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[420px] rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">

                <h2 className="text-xl font-semibold mb-4 text-gray-200">
                    {selected ? "Edit Brand" : "Add Brand"}
                </h2>

                <form onSubmit={formHandle(onSubmit)} className="space-y-3">

                    <input
                        {...register("name")}
                        className="input-dark"
                        placeholder="Name *"
                        required
                        onBlur={(e) => {
                            if (!selected) {
                                setValue("slug", generateSlug(e.target.value));
                            }
                        }}
                    />

                    <input
                        {...register("slug")}
                        className="input-dark"
                        placeholder="Slug"
                        readOnly={!!selected}
                    />

                    <textarea
                        {...register("description")}
                        className="input-dark"
                        placeholder="Description"
                    />

                    <input {...register("country")} className="input-dark" placeholder="Country" />

                    <input
                        {...register("websiteUrl")}
                        className="input-dark"
                        placeholder="Website (https://...)"
                    />

                    <input
                        {...register("logoUrl")}
                        className="input-dark"
                        placeholder="Logo URL"
                        onBlur={(e) => setLogoPreview(e.target.value)}
                    />

                    {logoPreview && (
                        <div className="mt-2 flex justify-center">
                            <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="h-16 object-contain"
                            />
                        </div>
                    )}

                    <input
                        type="number"
                        {...register("sortOrder")}
                        className="input-dark"
                        placeholder="Sort Order"
                    />

                    <label className="flex items-center gap-2 text-gray-300">
                        <input type="checkbox" {...register("isFeatured")} />
                        Featured brand
                    </label>

                    <input
                        {...register("metaTitle")}
                        className="input-dark"
                        placeholder="Meta Title (SEO)"
                    />

                    <textarea
                        {...register("metaDescription")}
                        className="input-dark"
                        placeholder="Meta Description (SEO)"
                    />

                    <label className="flex items-center gap-2 text-gray-300">
                        <input type="checkbox" {...register("isActive")} />
                        Active
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

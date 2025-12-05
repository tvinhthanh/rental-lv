"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { brandService } from "@/services/brand.service";
import { useFormSubmit } from "@/hooks/useHooks";
import { toast } from "sonner";

export default function BrandModal({ open, selected, onClose }: any) {
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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

    const handleUpload = async (file?: File) => {
        if (!file) return;
        try {
            setUploading(true);
            const baseURL = process.env.NEXT_PUBLIC_API_ENDPOINT;
            if (!baseURL) throw new Error("Missing NEXT_PUBLIC_API_ENDPOINT");
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : "";
            const fd = new FormData();
            fd.append("files", file);

            const res = await fetch(`${baseURL}/upload/images`, {
                method: "POST",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: fd
            });
            if (!res.ok) {
                throw new Error("Upload failed");
            }
            const json = await res.json();
            const url = json?.urls?.[0];
            if (!url) throw new Error("Upload failed");

            setValue("logoUrl", url);
            setLogoPreview(url);
            toast.success("Tải ảnh thành công");
        } catch (err: any) {
            toast.error(err?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
            <div className="bg-gradient-to-br from-[#0a1c35] via-[#0c274a] to-[#0b1424] border border-white/15 p-6 w-full max-w-3xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto text-white">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Thương hiệu</p>
                        <h2 className="text-2xl font-semibold">{selected ? "Chỉnh sửa brand" : "Thêm brand"}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white hover:text-[#0b1f3a] border border-white/30 flex items-center justify-center text-lg transition"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={formHandle(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field
                            label="Name *"
                            bordered
                            element={
                                <input
                                    {...register("name")}
                                    className="input-dark"
                                    placeholder="Name"
                                    required
                                    onBlur={(e) => {
                                        if (!selected) {
                                            setValue("slug", generateSlug(e.target.value));
                                        }
                                    }}
                                />
                            }
                        />
                        <Field
                            label="Slug"
                            bordered
                            element={
                                <input
                                    {...register("slug")}
                                    className="input-dark"
                                    placeholder="Slug"
                                    readOnly={!!selected}
                                />
                            }
                        />
                        <Field
                            label="Description"
                            full
                            bordered
                            element={
                                <textarea
                                    {...register("description")}
                                    className="input-dark h-20"
                                    placeholder="Description"
                                />
                            }
                        />
                        <Field label="Country" bordered element={<input {...register("country")} className="input-dark" placeholder="Country" />} />
                        <Field
                            label="Website"
                            bordered
                            element={
                                <input
                                    {...register("websiteUrl")}
                                    className="input-dark"
                                    placeholder="https://..."
                                />
                            }
                        />
                        <Field
                            label="Logo URL"
                            bordered
                            element={
                                <div className="space-y-2">
                                    <input
                                        {...register("logoUrl")}
                                        className="input-dark"
                                        placeholder="Logo URL"
                                        onBlur={(e) => setLogoPreview(e.target.value)}
                                    />
                                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                        <span className="px-3 py-2 rounded-lg bg-white text-[#0b1f3a] font-semibold shadow hover:-translate-y-0.5 transition">
                                            {uploading ? "Uploading..." : "Upload"}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handleUpload(e.target.files?.[0])}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/20 rounded-xl p-4 bg-white/5">
                        <div className="md:col-span-2 space-y-2">
                            <p className="text-sm text-blue-100">Upload logo</p>
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                                <span className="px-3 py-2 rounded-lg bg-white text-[#0b1f3a] font-semibold shadow hover:-translate-y-0.5 transition">
                                    {uploading ? "Uploading..." : "Upload"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleUpload(e.target.files?.[0])}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <div className="h-20 rounded border border-white/30 bg-white/5 flex items-center justify-center overflow-hidden">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-xs text-blue-100">Preview</span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Sort Order" bordered element={<input type="number" {...register("sortOrder")} className="input-dark" placeholder="0" />} />
                        <Field label="Meta Title (SEO)" bordered element={<input {...register("metaTitle")} className="input-dark" placeholder="Meta Title" />} />
                        <Field
                            label="Meta Description (SEO)"
                            full
                            bordered
                            element={<textarea {...register("metaDescription")} className="input-dark h-20" placeholder="Meta Description" />}
                        />
                    </div>

                    <div className="flex items-center gap-4 text-sm text-blue-100">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register("isFeatured")} className="accent-blue-500" />
                            Featured brand
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" {...register("isActive")} className="accent-blue-500" />
                            Active
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-white/20 text-blue-100 rounded-lg hover:bg-white hover:text-[#0b1f3a] transition"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="px-5 py-2 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition disabled:opacity-50"
                        >
                            {isPending ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, element, full = false, bordered = false }: { label: string; element: React.ReactNode; full?: boolean; bordered?: boolean }) {
    return (
        <div className={full ? "md:col-span-2 space-y-2" : "space-y-2"}>
            <p className="text-sm text-blue-100">{label}</p>
            <div className={bordered ? "rounded-lg border border-white/20 p-2 bg-white/5" : ""}>
                {element}
            </div>
        </div>
    );
}

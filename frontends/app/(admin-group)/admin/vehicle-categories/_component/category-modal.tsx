"use client";

import { useForm } from "react-hook-form";
import { useFormSubmit } from "@/hooks/useHooks";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
    const [uploading, setUploading] = useState(false);

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

            setValue("imageUrl", url);
            toast.success("Tải ảnh thành công");
        } catch (err: any) {
            toast.error(err?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!open) return null;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
            <div className="bg-gradient-to-br from-[#0a1c35] via-[#0c274a] to-[#0b1424] border border-white/15 p-6 w-full max-w-3xl rounded-2xl shadow-2xl text-white max-h-[90vh] overflow-y-auto">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Danh mục xe</p>
                        <h2 className="text-2xl font-semibold">{selected ? "Chỉnh sửa" : "Thêm danh mục"}</h2>
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
                        <Field label="Name *" bordered element={<input {...register("name")} className="input-dark" placeholder="Name" required />} />
                        <Field label="Code" bordered element={<input {...register("code")} className="input-dark" placeholder="Code" />} />
                        <Field label="Slug" bordered element={<input {...register("slug")} className="input-dark" placeholder="Slug" />} />
                        <Field label="Display Order" bordered element={<input {...register("displayOrder")} type="number" className="input-dark" placeholder="Display Order" />} />
                    </div>

                    <Field label="Short description" bordered full element={<textarea {...register("description")} className="input-dark h-20" placeholder="Short description" />} />

                    <div className="border border-white/20 rounded-xl p-4 bg-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-blue-100">Image (listing card)</p>
                            {imageUrl && <span className="text-xs text-blue-100 truncate max-w-[180px]">{imageUrl}</span>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                            <div className="md:col-span-2 space-y-2">
                                <input
                                    {...register("imageUrl")}
                                    className="input-dark"
                                    placeholder="Image URL"
                                    onBlur={(e) => setValue("imageUrl", e.target.value)}
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
                            <div className="h-24 rounded border border-white/30 bg-white/5 flex items-center justify-center overflow-hidden">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Category preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs text-blue-100">Preview</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Meta Title" bordered element={<input {...register("metaTitle")} className="input-dark" placeholder="Meta Title" />} />
                        <Field label="SEO Title" bordered element={<input {...register("seoTitle")} className="input-dark" placeholder="SEO Title" />} />
                        <Field label="Meta Description" bordered full element={<textarea {...register("metaDescription")} className="input-dark h-20" placeholder="Meta Description" />} />
                        <Field label="Heading Title (H1)" bordered element={<input {...register("hTitle")} className="input-dark" placeholder="Heading Title" />} />
                    </div>

                    <label className="flex items-center gap-2 text-blue-100">
                        <input type="checkbox" {...register("isActive")} className="accent-blue-500" />
                        Active
                    </label>

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="px-4 py-2 border border-white/20 text-blue-100 rounded-lg hover:bg-white hover:text-[#0b1f3a] transition">
                            Cancel
                        </button>

                        <button type="submit" disabled={isPending}
                            className="px-5 py-2 bg-white text-[#0b1f3a] font-semibold rounded-lg shadow hover:-translate-y-0.5 transition disabled:opacity-50">
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

"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import { toast } from "sonner";
import { X } from "lucide-react";

interface BlogCategoryModalProps {
    open: boolean;
    selected?: any | null;
    onClose: () => void;
    onSaved: () => void;
}

export default function BlogCategoryModal({ open, selected, onClose, onSaved }: BlogCategoryModalProps) {
    const [form, setForm] = useState({
        name: "",
        slug: "",
        description: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selected) {
            setForm({
                name: selected.name || "",
                slug: selected.slug || "",
                description: selected.description || "",
            });
        } else {
            setForm({
                name: "",
                slug: "",
                description: "",
            });
        }
    }, [selected, open]);

    const generateSlug = (name: string) =>
        name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name) {
            toast.error("Vui lòng nhập tên danh mục");
            return;
        }

        const payload: any = {
            ...form,
            slug: form.slug || generateSlug(form.name),
        };

        setSaving(true);
        try {
            if (selected) {
                await blogService.updateCategory(selected.id, payload);
                toast.success("Cập nhật danh mục thành công");
            } else {
                await blogService.createCategory(payload);
                toast.success("Tạo danh mục thành công");
            }
            onSaved();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lưu danh mục thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex z-[1000] animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="m-auto w-full max-w-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Blog Category</p>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {selected ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-red-500/20 hover:text-red-400 border border-white/20 transition-colors"
                        type="button"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Tên danh mục *</label>
                        <input
                            value={form.name}
                            onChange={(e) => {
                                setForm({ ...form, name: e.target.value });
                                if (!selected && !form.slug) {
                                    setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                                }
                            }}
                            required
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="Tên danh mục"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Slug</label>
                        <input
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="slug-tu-dong"
                            readOnly={!!selected}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Mô tả</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="Mô tả danh mục"
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : selected ? (
                                "Cập nhật"
                            ) : (
                                "Tạo danh mục"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

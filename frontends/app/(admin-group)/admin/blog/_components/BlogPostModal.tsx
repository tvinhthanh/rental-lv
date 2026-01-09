"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import { toast } from "sonner";
import { X } from "lucide-react";
import HtmlEditor from "@/components/editor/html-editor";
import ImageUpload from "@/components/upload/image-upload";

interface BlogPostModalProps {
    open: boolean;
    selected?: any | null;
    categories: any[];
    onClose: () => void;
    onSaved: () => void;
}

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function BlogPostModal({ open, selected, categories, onClose, onSaved }: BlogPostModalProps) {
    const [form, setForm] = useState({
        title: "",
        slug: "",
        content: "",
        excerpt: "",
        thumbnailUrl: "",
        categoryId: "",
        status: "DRAFT",
        metaTitle: "",
        metaDescription: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (selected) {
            setForm({
                title: selected.title || "",
                slug: selected.slug || "",
                content: selected.content || "",
                excerpt: selected.excerpt || "",
                thumbnailUrl: selected.thumbnailUrl || "",
                categoryId: selected.categoryId || "",
                status: selected.status || "DRAFT",
                metaTitle: selected.metaTitle || "",
                metaDescription: selected.metaDescription || "",
            });
        } else {
            setForm({
                title: "",
                slug: "",
                content: "",
                excerpt: "",
                thumbnailUrl: "",
                categoryId: "",
                status: "DRAFT",
                metaTitle: "",
                metaDescription: "",
            });
        }
    }, [selected, open]);

    const generateSlug = (title: string) =>
        title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9\-]/g, "");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.content) {
            toast.error("Vui lòng nhập tiêu đề và nội dung");
            return;
        }

        const payload: any = {
            ...form,
            slug: form.slug || generateSlug(form.title),
            categoryId: form.categoryId || undefined,
        };

        setSaving(true);
        try {
            if (selected) {
                await blogService.updatePost(selected.id, payload);
                toast.success("Cập nhật bài viết thành công");
            } else {
                await blogService.createPost(payload);
                toast.success("Tạo bài viết thành công");
            }
            onSaved();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lưu bài viết thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex z-[1000] animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="m-auto w-full max-w-4xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-700">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-1">Blog Post</p>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                            {selected ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
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
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm text-slate-200">Tiêu đề *</label>
                            <input
                                value={form.title}
                                onChange={(e) => {
                                    setForm({ ...form, title: e.target.value });
                                    if (!selected && !form.slug) {
                                        setForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                                    }
                                }}
                                required
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Tiêu đề bài viết"
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
                            <label className="text-sm text-slate-200">Danh mục</label>
                            <select
                                value={form.categoryId}
                                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Trạng thái</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            >
                                {STATUS_OPTIONS.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Mô tả ngắn</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                            rows={2}
                            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            placeholder="Mô tả ngắn về bài viết"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Hình ảnh đại diện</label>
                        <ImageUpload
                            value={form.thumbnailUrl}
                            onChange={(url) => setForm({ ...form, thumbnailUrl: url })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-slate-200">Nội dung *</label>
                        <HtmlEditor
                            value={form.content}
                            onChange={(content) => setForm({ ...form, content })}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Meta Title (SEO)</label>
                            <input
                                value={form.metaTitle}
                                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Meta title cho SEO"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Meta Description (SEO)</label>
                            <textarea
                                value={form.metaDescription}
                                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Meta description cho SEO"
                            />
                        </div>
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
                                "Tạo bài viết"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

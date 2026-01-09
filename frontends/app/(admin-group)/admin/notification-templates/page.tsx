"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { notificationTemplateService } from "@/services/notification-template.service";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function AdminNotificationTemplatesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;
            if (typeFilter) params.type = typeFilter;
            const res = await notificationTemplateService.list(params);
            const items = Array.isArray(res) ? res : (res?.items || []);
            setTemplates(items);
            setTotal(items.length);
        } catch (err) {
            setError("Không thể tải danh sách template");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (template: any) => {
        if (!confirm("Xóa template này?")) return;
        try {
            await notificationTemplateService.delete(template.id);
            toast.success("Đã xóa template");
            loadTemplates();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa template thất bại");
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }
        loadTemplates();
    }, [user, userLoading, search, typeFilter]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Notification Templates
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý templates cho email, SMS, push notifications
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng templates</p>
                        <p className="text-lg font-semibold text-blue-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:-translate-y-0.5 transition"
                        onClick={() => {
                            setEditingTemplate(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm Template
                    </button>
                </div>

                <div className="mb-4 flex gap-3">
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="input-dark border p-2 rounded w-64"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="input-dark border p-2 rounded"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="">Tất cả loại</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="push">Push</option>
                    </select>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-500/50 bg-red-900/30 p-3 text-red-300">
                        {error}
                    </div>
                )}

                {templates.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Mail className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có template nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6 transition hover:border-blue-500/50"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{template.name}</h3>
                                        <p className="text-xs text-slate-400">Code: {template.code}</p>
                                    </div>
                                    <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                                        {template.type}
                                    </span>
                                </div>
                                {template.subject && (
                                    <p className="mb-2 text-sm text-slate-300">{template.subject}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                        onClick={() => {
                                            setEditingTemplate(template);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                        onClick={() => handleDelete(template)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openForm && (
                    <NotificationTemplateModal
                        template={editingTemplate}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingTemplate(null);
                        }}
                        onSuccess={loadTemplates}
                    />
                )}
            </div>
        </div>
    );
}

function NotificationTemplateModal({ template, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: template?.name || "",
        code: template?.code || "",
        subject: template?.subject || "",
        content: template?.content || "",
        type: template?.type || "email",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate name
        if (!formData.name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }
        if (formData.name.length > 200) {
            toast.error("Tên không được vượt quá 200 ký tự");
            return;
        }
        
        // Validate code
        if (!formData.code.trim()) {
            toast.error("Code không được để trống");
            return;
        }
        if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            toast.error("Code chỉ được chứa chữ in hoa, số và dấu gạch dưới");
            return;
        }
        if (formData.code.length > 50) {
            toast.error("Code không được vượt quá 50 ký tự");
            return;
        }
        
        // Validate type
        if (!['email', 'sms', 'push'].includes(formData.type)) {
            toast.error("Loại không hợp lệ");
            return;
        }
        
        // Validate subject (required for email)
        if (formData.type === 'email' && !formData.subject?.trim()) {
            toast.error("Subject là bắt buộc cho email");
            return;
        }
        if (formData.subject && formData.subject.length > 500) {
            toast.error("Subject không được vượt quá 500 ký tự");
            return;
        }
        
        // Validate content
        if (formData.content && formData.content.length > 10000) {
            toast.error("Content không được vượt quá 10000 ký tự");
            return;
        }
        
        try {
            setLoading(true);
            if (template) {
                await notificationTemplateService.update(template.id, formData);
                toast.success("Đã cập nhật template");
            } else {
                await notificationTemplateService.create(formData);
                toast.success("Đã tạo template");
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6">
                <h2 className="mb-4 text-2xl font-bold text-white">
                    {template ? "Sửa Template" : "Thêm Template"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300">Tên</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Code</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Loại</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="email">Email</option>
                            <option value="sms">SMS</option>
                            <option value="push">Push</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Subject</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Content</label>
                        <textarea
                            className="input-dark mt-1 w-full border p-2 rounded"
                            rows={6}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="flex-1 rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
                            onClick={onClose}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : template ? "Cập nhật" : "Tạo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


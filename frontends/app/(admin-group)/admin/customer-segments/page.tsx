"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { customerSegmentService } from "@/services/customer-segment.service";
import { Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomerSegmentsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [segments, setSegments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState<number>(0);
    const [editingSegment, setEditingSegment] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);

    const loadSegments = async () => {
        try {
            setLoading(true);
            const res = await customerSegmentService.list();
            const items = Array.isArray(res) ? res : (res?.items || []);
            setSegments(items);
            setTotal(items.length);
        } catch (err) {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }
        loadSegments();
    }, [user, userLoading]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white">Customer Segments</h1>
                        <p className="mt-1 text-sm text-slate-400">Phân khúc khách hàng</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng segments</p>
                        <p className="text-lg font-semibold text-green-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold"
                        onClick={() => {
                            setEditingSegment(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm Segment
                    </button>
                </div>

                {segments.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Users className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có segment nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {segments.map((segment) => (
                            <div
                                key={segment.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{segment.name}</h3>
                                {segment.description && (
                                    <p className="text-sm text-slate-400 mb-3">{segment.description}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                        onClick={() => {
                                            setEditingSegment(segment);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                        onClick={async () => {
                                            if (!confirm("Xóa segment này?")) return;
                                            try {
                                                await customerSegmentService.delete(segment.id);
                                                toast.success("Đã xóa");
                                                loadSegments();
                                            } catch (err: any) {
                                                toast.error(err?.response?.data?.message || "Thất bại");
                                            }
                                        }}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openForm && (
                    <SegmentModal
                        segment={editingSegment}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingSegment(null);
                        }}
                        onSuccess={loadSegments}
                    />
                )}
            </div>
        </div>
    );
}

function SegmentModal({ segment, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: segment?.name || "",
        description: segment?.description || "",
        conditions: segment?.conditions ? JSON.stringify(segment.conditions, null, 2) : "{}",
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
        
        // Validate description
        if (formData.description && formData.description.length > 1000) {
            toast.error("Mô tả không được vượt quá 1000 ký tự");
            return;
        }
        
        // Validate JSON
        if (!formData.conditions.trim()) {
            toast.error("Conditions không được để trống");
            return;
        }
        
        let parsedConditions;
        try {
            parsedConditions = JSON.parse(formData.conditions);
        } catch (jsonErr) {
            toast.error("JSON không hợp lệ. Vui lòng kiểm tra lại format.");
            return;
        }
        
        // Validate JSON structure (must be object)
        if (typeof parsedConditions !== 'object' || Array.isArray(parsedConditions)) {
            toast.error("Conditions phải là một object JSON");
            return;
        }
        
        // Validate JSON size (prevent too large)
        if (JSON.stringify(parsedConditions).length > 5000) {
            toast.error("Conditions quá lớn (tối đa 5000 ký tự)");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                ...formData,
                name: formData.name.trim(),
                description: formData.description?.trim() || undefined,
                conditions: parsedConditions,
            };
            if (segment) {
                await customerSegmentService.update(segment.id, payload);
                toast.success("Đã cập nhật");
            } else {
                await customerSegmentService.create(payload);
                toast.success("Đã tạo");
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
                    {segment ? "Sửa Segment" : "Thêm Segment"}
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
                        <label className="block text-sm text-slate-300">Mô tả</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Conditions (JSON)</label>
                        <textarea
                            className="input-dark mt-1 w-full border p-2 rounded font-mono text-sm"
                            rows={8}
                            value={formData.conditions}
                            onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                            required
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
                            {loading ? "Đang xử lý..." : segment ? "Cập nhật" : "Tạo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


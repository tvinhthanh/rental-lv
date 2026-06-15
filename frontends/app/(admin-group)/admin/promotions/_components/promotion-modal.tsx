"use client";

import { useEffect, useMemo, useState } from "react";
import { promotionService } from "@/services/promotion.service";
import { toast } from "sonner";

type PromotionModalProps = {
    open: boolean;
    selected?: any | null;
    onClose: () => void;
    onSaved: () => void;
};

const baseForm = {
    code: "",
    name: "",
    description: "",
    discountPercent: "",
    discountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    status: "ACTIVE",
};

export default function PromotionModal({ open, selected, onClose, onSaved }: PromotionModalProps) {
    const [form, setForm] = useState<any>(baseForm);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (selected) {
            setForm({
                ...baseForm,
                ...selected,
                discountPercent: selected.discountPercent ?? "",
                discountAmount: selected.discountAmount ?? "",
                usageLimit: selected.usageLimit ?? "",
                startDate: selected.startDate ? new Date(selected.startDate).toISOString().slice(0, 10) : "",
                endDate: selected.endDate ? new Date(selected.endDate).toISOString().slice(0, 10) : "",
                status: selected.status || "ACTIVE",
            });
        } else {
            setForm(baseForm);
        }
    }, [selected, open]);

    const hasDiscount = useMemo(
        () => form.discountPercent !== "" || form.discountAmount !== "",
        [form.discountAmount, form.discountPercent]
    );

    const validate = () => {
        const errs: Record<string, string> = {};
        const code = (form.code || "").trim().toUpperCase();
        if (!code) errs.code = "Mã khuyến mãi bắt buộc";
        else if (!/^[A-Z0-9]+$/.test(code)) errs.code = "Mã chỉ gồm chữ in hoa và số, không cách";

        if (!form.name || form.name.trim().length < 2) errs.name = "Tên tối thiểu 2 ký tự";
        if (!hasDiscount) errs.discount = "Cần nhập % hoặc số tiền giảm";

        if (form.discountPercent !== "" && form.discountPercent !== null) {
            const val = Number(form.discountPercent);
            if (Number.isNaN(val) || val < 0 || val > 100) errs.discountPercent = "Phần trăm 0 - 100";
        }
        if (form.discountAmount !== "" && form.discountAmount !== null) {
            const val = Number(form.discountAmount);
            if (Number.isNaN(val) || val <= 0) errs.discountAmount = "Số tiền phải > 0";
        }
        if (form.usageLimit !== "" && form.usageLimit !== null) {
            const val = Number(form.usageLimit);
            if (Number.isNaN(val) || val <= 0) errs.usageLimit = "Giới hạn phải > 0";
        }
        if (form.startDate && form.endDate) {
            const start = new Date(form.startDate);
            const end = new Date(form.endDate);
            if (start >= end) errs.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
        }
        if (form.endDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const end = new Date(form.endDate);
            end.setHours(0, 0, 0, 0);
            if (end < today) errs.endDate = "Ngày kết thúc không được ở quá khứ";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload: any = {
            code: form.code?.trim().toUpperCase(),
            name: form.name?.trim(),
            description: form.description?.trim() || undefined,
            discountPercent: form.discountPercent === "" ? undefined : Number(form.discountPercent),
            discountAmount: form.discountAmount === "" ? undefined : Number(form.discountAmount),
            usageLimit: form.usageLimit === "" ? undefined : Number(form.usageLimit),
            startDate: form.startDate || undefined,
            endDate: form.endDate || undefined,
            status: form.status || "ACTIVE",
        };

        setSaving(true);
        try {
            if (selected) {
                await promotionService.update(selected.id, payload);
                toast.success("Cập nhật khuyến mãi thành công");
            } else {
                await promotionService.create(payload);
                toast.success("Tạo khuyến mãi thành công");
            }
            onSaved();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Lưu khuyến mãi thất bại");
        } finally {
            setSaving(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex z-[1000]" onClick={onClose}>
            <div
                className="m-auto w-full max-w-3xl bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Khuyến mãi</p>
                        <h2 className="text-2xl font-bold">{selected ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi"}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white hover:text-slate-900 border border-white/20"
                        type="button"
                    >
                        ×
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Mã khuyến mãi *</label>
                            <input
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value })}
                                required
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="VD: SUMMER50"
                            />
                            {errors.code && <p className="text-xs text-rose-400">{errors.code}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Tên chương trình *</label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Giảm giá mùa hè"
                            />
                            {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
                        </div>
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-sm text-slate-200">Mô tả</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={2}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Nội dung khuyến mãi, điều kiện áp dụng..."
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">% giảm</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                step="0.01"
                                value={form.discountPercent}
                                onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Ví dụ: 10"
                            />
                            {errors.discountPercent && <p className="text-xs text-rose-400">{errors.discountPercent}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Giảm tiền (đ)</label>
                            <input
                                type="number"
                                min={0}
                                value={form.discountAmount}
                                onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Ví dụ: 50000"
                            />
                            {errors.discountAmount && <p className="text-xs text-rose-400">{errors.discountAmount}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Giới hạn lượt dùng</label>
                            <input
                                type="number"
                                min={1}
                                value={form.usageLimit}
                                onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                                placeholder="Không bắt buộc"
                            />
                            {errors.usageLimit && <p className="text-xs text-rose-400">{errors.usageLimit}</p>}
                        </div>
                    </div>
                    {errors.discount && <p className="text-xs text-rose-400">{errors.discount}</p>}

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Ngày bắt đầu</label>
                            <input
                                type="date"
                                value={form.startDate}
                                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={form.endDate}
                                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            />
                            {(errors.dateRange || errors.endDate) && <p className="text-xs text-rose-400">{errors.dateRange || errors.endDate}</p>}
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm text-slate-200">Trạng thái</label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 focus:outline-none focus:border-blue-400"
                            >
                                <option value="ACTIVE">Hoạt động</option>
                                <option value="INACTIVE">Không hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 border border-white/10"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2 rounded-lg bg-purple-600 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                        >
                            {saving ? "Đang lưu..." : selected ? "Lưu thay đổi" : "Tạo mới"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

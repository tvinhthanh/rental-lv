"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { pricingRuleService } from "@/services/pricing-rule.service";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminPricingRulesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState<number>(0);
    const [editingRule, setEditingRule] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [categories, setCategories] = useState<any[]>([]);

    const loadRules = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (categoryFilter) params.categoryId = categoryFilter;
            const res = await pricingRuleService.list(params);
            setRules(Array.isArray(res) ? res : (res?.items || []));
            setTotal(Array.isArray(res) ? res.length : (res?.items?.length || 0));
        } catch (err) {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        vehicleCategoryService.list().then((r: any) => {
            const items = Array.isArray(r) ? r : (r?.items || []);
            setCategories(items);
        });
    }, []);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") return;
        loadRules();
    }, [user, userLoading, categoryFilter]);

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
                        <h1 className="text-3xl font-extrabold tracking-wide text-white">Quy tắc Định giá</h1>
                        <p className="mt-1 text-sm text-slate-400">Quy tắc định giá động</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng quy tắc</p>
                        <p className="text-lg font-semibold text-yellow-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-yellow-600 text-white font-semibold hover:bg-yellow-700 transition-colors"
                        onClick={() => {
                            setEditingRule(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm quy tắc
                    </button>
                </div>

                <div className="mb-4">
                    <select
                        className="bg-slate-800/70 border border-slate-700 text-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        <option value="" className="bg-slate-900 text-gray-200">Tất cả danh mục</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id} className="bg-slate-900 text-gray-200">{c.name}</option>
                        ))}
                    </select>
                </div>

                {rules.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <DollarSign className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có quy tắc nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {rules.map((rule) => (
                            <div
                                key={rule.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{rule.name}</h3>
                                <p className="text-sm text-slate-400 mb-2">
                                    Danh mục: {rule.category?.name || "N/A"}
                                </p>
                                <p className="text-sm text-slate-400 mb-2">
                                    Loại: {rule.type === 'weekend' ? 'Cuối tuần' : rule.type === 'holiday' ? 'Ngày lễ' : rule.type === 'seasonal' ? 'Theo mùa' : rule.type}
                                </p>
                                <div className="space-y-1 text-sm">
                                    {rule.percent && (
                                        <p className="text-slate-300">Tăng: +{rule.percent}%</p>
                                    )}
                                    {rule.amount && (
                                        <p className="text-slate-300">Tăng: +{rule.amount.toLocaleString()} đ</p>
                                    )}
                                    {rule.startDate && rule.endDate && (
                                        <p className="text-slate-400 text-xs">
                                            {new Date(rule.startDate).toLocaleDateString("vi-VN")} - {new Date(rule.endDate).toLocaleDateString("vi-VN")}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => {
                                            setEditingRule(rule);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={async () => {
                                            if (!confirm("Xóa rule này?")) return;
                                            try {
                                                await pricingRuleService.delete(rule.id);
                                                toast.success("Đã xóa");
                                                loadRules();
                                            } catch (err: any) {
                                                toast.error(err?.response?.data?.message || "Thất bại");
                                            }
                                        }}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openForm && (
                    <PricingRuleModal
                        rule={editingRule}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingRule(null);
                        }}
                        onSuccess={loadRules}
                    />
                )}
            </div>
        </div>
    );
}

function PricingRuleModal({ rule, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        categoryId: rule?.categoryId || "",
        name: rule?.name || "",
        type: rule?.type || "weekend",
        percent: rule?.percent || "",
        amount: rule?.amount || "",
        startDate: rule?.startDate ? new Date(rule.startDate).toISOString().slice(0, 10) : "",
        endDate: rule?.endDate ? new Date(rule.endDate).toISOString().slice(0, 10) : "",
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        vehicleCategoryService.list().then((r: any) => {
            const items = Array.isArray(r) ? r : (r?.items || []);
            setCategories(items);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate category
        if (!formData.categoryId) {
            toast.error("Vui lòng chọn danh mục");
            return;
        }
        
        // Validate name
        if (!formData.name.trim()) {
            toast.error("Tên không được để trống");
            return;
        }
        if (formData.name.length > 200) {
            toast.error("Tên không được vượt quá 200 ký tự");
            return;
        }
        
        // Validate type
        if (!['weekend', 'holiday', 'seasonal'].includes(formData.type)) {
            toast.error("Loại không hợp lệ");
            return;
        }
        
        // Validate percent or amount (at least one required)
        if (!formData.percent && !formData.amount) {
            toast.error("Vui lòng nhập phần trăm hoặc số tiền tăng");
            return;
        }
        
        // Validate percent range
        if (formData.percent) {
            const percentNum = Number(formData.percent);
            if (isNaN(percentNum)) {
                toast.error("Phần trăm phải là số");
                return;
            }
            if (percentNum < 0 || percentNum > 100) {
                toast.error("Phần trăm phải từ 0 đến 100");
                return;
            }
            if (percentNum % 0.01 !== 0) {
                toast.error("Phần trăm chỉ được có tối đa 2 chữ số thập phân");
                return;
            }
        }
        
        // Validate amount range
        if (formData.amount) {
            const amountNum = Number(formData.amount);
            if (isNaN(amountNum)) {
                toast.error("Số tiền phải là số");
                return;
            }
            if (amountNum < 0) {
                toast.error("Số tiền phải lớn hơn hoặc bằng 0");
                return;
            }
            if (amountNum > 100000000) {
                toast.error("Số tiền không được vượt quá 100,000,000 đ");
                return;
            }
        }
        
        // Validate date range
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                toast.error("Ngày tháng không hợp lệ");
                return;
            }
            
            if (start > end) {
                toast.error("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
                return;
            }
            
            // Validate date range not too long (max 1 year)
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
                toast.error("Khoảng thời gian không được vượt quá 365 ngày");
                return;
            }
        }
        
        // Validate at least one date if seasonal
        if (formData.type === 'seasonal' && !formData.startDate && !formData.endDate) {
            toast.error("Loại theo mùa cần có ngày bắt đầu và kết thúc");
            return;
        }
        
        try {
            setLoading(true);
            const payload = {
                ...formData,
                name: formData.name.trim(),
                percent: formData.percent ? Number(formData.percent) : undefined,
                amount: formData.amount ? Number(formData.amount) : undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
            };
            if (rule) {
                await pricingRuleService.update(rule.id, payload);
                toast.success("Đã cập nhật");
            } else {
                await pricingRuleService.create(payload);
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
                    {rule ? "Sửa Quy tắc Định giá" : "Thêm Quy tắc Định giá"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300">Danh mục</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                        >
                            <option value="">Chọn danh mục</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
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
                        <label className="block text-sm text-slate-300">Loại</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            required
                        >
                            <option value="weekend">Cuối tuần</option>
                            <option value="holiday">Ngày lễ</option>
                            <option value="seasonal">Theo mùa</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-300">Phần trăm (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="input-dark mt-1 w-full border p-2 rounded"
                                value={formData.percent}
                                onChange={(e) => setFormData({ ...formData, percent: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300">Số tiền (đ)</label>
                            <input
                                type="number"
                                className="input-dark mt-1 w-full border p-2 rounded"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-300">Ngày bắt đầu</label>
                            <input
                                type="date"
                                className="input-dark mt-1 w-full border p-2 rounded"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-300">Ngày kết thúc</label>
                            <input
                                type="date"
                                className="input-dark mt-1 w-full border p-2 rounded"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="danger"
                            className="flex-1"
                            onClick={onClose}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            loading={loading}
                        >
                            {rule ? "Cập nhật" : "Tạo"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


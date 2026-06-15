"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { loyaltyProgramService } from "@/services/loyalty-program.service";
import { Award } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminLoyaltyProgramsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [programs, setPrograms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState<number>(0);
    const [editingProgram, setEditingProgram] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);

    const loadPrograms = async () => {
        try {
            setLoading(true);
            const res = await loyaltyProgramService.list();
            const items = Array.isArray(res) ? res : (res?.items || []);
            setPrograms(items);
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
        loadPrograms();
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
                        <h1 className="text-3xl font-extrabold tracking-wide text-white">Chương Trình Tích Điểm</h1>
                        <p className="mt-1 text-sm text-slate-400">Thiết lập chương trình điểm thưởng khách hàng thân thiết</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng chương trình</p>
                        <p className="text-lg font-semibold text-amber-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                        onClick={() => {
                            setEditingProgram(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm chương trình
                    </button>
                </div>

                {programs.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Award className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có chương trình tích điểm nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <div
                                key={program.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6 animate-fade-in"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{program.name}</h3>
                                {program.description && (
                                    <p className="text-sm text-slate-400 mb-3">{program.description}</p>
                                )}
                                <div className="space-y-1 text-sm">
                                    {program.minAmount && (
                                        <p className="text-slate-300">Số tiền tối thiểu: {program.minAmount.toLocaleString()} đ</p>
                                    )}
                                    {program.pointsPer100k && (
                                        <p className="text-slate-300">
                                            Điểm tích lũy: {program.pointsPer100k} điểm / 100,000 đ
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => {
                                            setEditingProgram(program);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={async () => {
                                            if (!confirm("Bạn có chắc chắn muốn xóa chương trình này?")) return;
                                            try {
                                                await loyaltyProgramService.delete(program.id);
                                                toast.success("Đã xóa thành công");
                                                loadPrograms();
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
                    <ProgramModal
                        program={editingProgram}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingProgram(null);
                        }}
                        onSuccess={loadPrograms}
                    />
                )}
            </div>
        </div>
    );
}

function ProgramModal({ program, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: program?.name || "",
        minAmount: program?.minAmount || "",
        pointsPer100k: program?.pointsPer100k || "",
        description: program?.description || "",
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
        
        // Validate minAmount
        if (formData.minAmount) {
            const minAmountNum = Number(formData.minAmount);
            if (isNaN(minAmountNum)) {
                toast.error("Số tiền tối thiểu phải là số");
                return;
            }
            if (minAmountNum < 0) {
                toast.error("Số tiền tối thiểu phải lớn hơn hoặc bằng 0");
                return;
            }
            if (minAmountNum > 1000000000) {
                toast.error("Số tiền tối thiểu không được vượt quá 1,000,000,000 đ");
                return;
            }
        }
        
        // Validate pointsPer100k
        if (formData.pointsPer100k) {
            const pointsNum = Number(formData.pointsPer100k);
            if (isNaN(pointsNum)) {
                toast.error("Số điểm trên mỗi 100k phải là số");
                return;
            }
            if (pointsNum < 0) {
                toast.error("Số điểm trên mỗi 100k phải lớn hơn hoặc bằng 0");
                return;
            }
            if (!Number.isInteger(pointsNum)) {
                toast.error("Số điểm trên mỗi 100k phải là số nguyên");
                return;
            }
            if (pointsNum > 10000) {
                toast.error("Số điểm trên mỗi 100k không được vượt quá 10,000");
                return;
            }
        }
        
        try {
            setLoading(true);
            const payload = {
                ...formData,
                name: formData.name.trim(),
                description: formData.description?.trim() || undefined,
                minAmount: formData.minAmount ? Number(formData.minAmount) : undefined,
                pointsPer100k: formData.pointsPer100k ? Number(formData.pointsPer100k) : undefined,
            };
            if (program) {
                await loyaltyProgramService.update(program.id, payload);
                toast.success("Đã cập nhật thành công");
            } else {
                await loyaltyProgramService.create(payload);
                toast.success("Đã tạo thành công");
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
                <h2 className="mb-4 text-2xl font-bold text-white">
                    {program ? "Sửa chương trình" : "Thêm chương trình"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-300 font-medium">Tên chương trình</label>
                        <input
                            type="text"
                            className="bg-slate-800/70 border border-slate-700 text-gray-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full mt-1"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 font-medium">Số tiền tối thiểu (đ)</label>
                        <input
                            type="number"
                            className="bg-slate-800/70 border border-slate-700 text-gray-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full mt-1"
                            value={formData.minAmount}
                            onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 font-medium">Điểm tích lũy trên mỗi 100,000 đ</label>
                        <input
                            type="number"
                            className="bg-slate-800/70 border border-slate-700 text-gray-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full mt-1"
                            value={formData.pointsPer100k}
                            onChange={(e) => setFormData({ ...formData, pointsPer100k: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300 font-medium">Mô tả</label>
                        <textarea
                            className="bg-slate-800/70 border border-slate-700 text-gray-200 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-full mt-1"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
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
                            {program ? "Cập nhật" : "Tạo"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


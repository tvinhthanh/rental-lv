"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { partnerService } from "@/services/partner.service";
import { Handshake } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminPartnersPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [partners, setPartners] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState<number>(0);
    const [editingPartner, setEditingPartner] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const loadPartners = async () => {
        try {
            setLoading(true);
            const params: any = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;
            const res = await partnerService.list(params);
            const items = Array.isArray(res) ? res : (res?.items || []);
            setPartners(items);
            setTotal(items.length);
        } catch (err) {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (partner: any) => {
        if (!confirm("Xóa đối tác này?")) return;
        try {
            await partnerService.delete(partner.id);
            toast.success("Đã xóa đối tác");
            loadPartners();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa đối tác thất bại");
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") return;
        Promise.resolve().then(() => loadPartners());
    }, [user, userLoading, search, statusFilter]);

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
                            Đối Tác
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý đối tác và affiliate
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng đối tác</p>
                        <p className="text-lg font-semibold text-indigo-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:-translate-y-0.5 transition"
                        onClick={() => {
                            setEditingPartner(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm Đối Tác
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
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">Tất cả trạng thái</option>
                        <option value="ACTIVE">Hoạt động</option>
                        <option value="INACTIVE">Không hoạt động</option>
                    </select>
                </div>

                {partners.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Handshake className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có partner nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {partners.map((partner) => (
                            <div
                                key={partner.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6 transition hover:border-indigo-500/50"
                            >
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{partner.name}</h3>
                                        <p className="text-xs text-slate-400">Mã: {partner.code}</p>
                                    </div>
                                    <span className={`rounded-full px-2 py-1 text-xs ${
                                        partner.status === 'ACTIVE' 
                                            ? 'bg-green-500/20 text-green-300' 
                                            : 'bg-red-500/20 text-red-300'
                                    }`}>
                                        {partner.status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}
                                    </span>
                                </div>
                                {partner.email && (
                                    <p className="mb-1 text-sm text-slate-300">Email: {partner.email}</p>
                                )}
                                {partner.phone && (
                                    <p className="mb-1 text-sm text-slate-300">Số điện thoại: {partner.phone}</p>
                                )}
                                {partner.note && (
                                    <p className="mb-3 text-sm text-slate-400">{partner.note}</p>
                                )}
                                <div className="mt-4 flex gap-2">
                                    <Button
                                        variant="primary"
                                        className="flex-1"
                                        size="sm"
                                        onClick={() => {
                                            setEditingPartner(partner);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDelete(partner)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {openForm && (
                    <PartnerModal
                        partner={editingPartner}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingPartner(null);
                        }}
                        onSuccess={loadPartners}
                    />
                )}
            </div>
        </div>
    );
}

function PartnerModal({ partner, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: partner?.name || "",
        code: partner?.code || "",
        phone: partner?.phone || "",
        email: partner?.email || "",
        note: partner?.note || "",
        status: partner?.status || "ACTIVE",
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
            toast.error("Mã đối tác không được để trống");
            return;
        }
        if (!/^[A-Z0-9_]+$/.test(formData.code)) {
            toast.error("Mã đối tác chỉ được chứa chữ in hoa, số và dấu gạch dưới");
            return;
        }
        if (formData.code.length < 3) {
            toast.error("Mã đối tác phải có ít nhất 3 ký tự");
            return;
        }
        if (formData.code.length > 50) {
            toast.error("Mã đối tác không được vượt quá 50 ký tự");
            return;
        }
        
        // Validate email format if provided
        if (formData.email) {
            if (!formData.email.trim()) {
                toast.error("Email không được để trống nếu đã nhập");
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                toast.error("Email không hợp lệ");
                return;
            }
            if (formData.email.length > 255) {
                toast.error("Email không được vượt quá 255 ký tự");
                return;
            }
        }
        
        // Validate phone format if provided
        if (formData.phone) {
            if (!formData.phone.trim()) {
                toast.error("Số điện thoại không được để trống nếu đã nhập");
                return;
            }
            // Remove spaces and special chars for validation
            const phoneDigits = formData.phone.replace(/[\s\-\(\)]/g, '');
            if (!/^[0-9]+$/.test(phoneDigits)) {
                toast.error("Số điện thoại chỉ được chứa số");
                return;
            }
            if (phoneDigits.length < 10) {
                toast.error("Số điện thoại phải có ít nhất 10 số");
                return;
            }
            if (phoneDigits.length > 15) {
                toast.error("Số điện thoại không được vượt quá 15 số");
                return;
            }
        }
        
        // Validate note
        if (formData.note && formData.note.length > 1000) {
            toast.error("Ghi chú không được vượt quá 1000 ký tự");
            return;
        }
        
        // Validate status
        if (!['ACTIVE', 'INACTIVE'].includes(formData.status)) {
            toast.error("Trạng thái không hợp lệ");
            return;
        }
        
        try {
            setLoading(true);
            const payload = {
                ...formData,
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                email: formData.email?.trim() || undefined,
                phone: formData.phone?.trim() || undefined,
                note: formData.note?.trim() || undefined,
            };
            if (partner) {
                await partnerService.update(partner.id, payload);
                toast.success("Đã cập nhật đối tác");
            } else {
                await partnerService.create(payload);
                toast.success("Đã tạo đối tác");
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
                    {partner ? "Sửa Đối Tác" : "Thêm Đối Tác"}
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
                        <label className="block text-sm text-slate-300">Mã đối tác</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Số điện thoại</label>
                        <input
                            type="text"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Email</label>
                        <input
                            type="email"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Ghi chú</label>
                        <textarea
                            className="input-dark mt-1 w-full border p-2 rounded"
                            rows={3}
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Trạng thái</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="INACTIVE">Không hoạt động</option>
                        </select>
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
                            {partner ? "Cập nhật" : "Tạo"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}


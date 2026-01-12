"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { marketingCampaignService } from "@/services/marketing-campaign.service";
import { customerSegmentService } from "@/services/customer-segment.service";
import { notificationTemplateService } from "@/services/notification-template.service";
import { Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function AdminMarketingCampaignsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState<number>(0);
    const [editingCampaign, setEditingCampaign] = useState<any | null>(null);
    const [openForm, setOpenForm] = useState(false);

    const loadCampaigns = async () => {
        try {
            setLoading(true);
            const res = await marketingCampaignService.list();
            const items = Array.isArray(res) ? res : (res?.items || []);
            setCampaigns(items);
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
        loadCampaigns();
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
                        <h1 className="text-3xl font-extrabold tracking-wide text-white">Marketing Campaigns</h1>
                        <p className="mt-1 text-sm text-slate-400">Chiến dịch marketing</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng campaigns</p>
                        <p className="text-lg font-semibold text-purple-400">{total}</p>
                    </div>
                    <button
                        className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold"
                        onClick={() => {
                            setEditingCampaign(null);
                            setOpenForm(true);
                        }}
                    >
                        + Thêm Campaign
                    </button>
                </div>

                {campaigns.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Megaphone className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có campaign nào.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                className="rounded-xl border border-slate-700 bg-slate-900/70 p-6"
                            >
                                <h3 className="text-lg font-semibold text-white mb-2">{campaign.name}</h3>
                                <p className="text-sm text-slate-400 mb-2">
                                    Segment: {campaign.segment?.name || "N/A"}
                                </p>
                                <p className="text-sm text-slate-400 mb-2">
                                    Template: {campaign.template?.name || "N/A"}
                                </p>
                                <span className="inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-300 mb-3">
                                    {campaign.status}
                                </span>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                                        onClick={() => {
                                            setEditingCampaign(campaign);
                                            setOpenForm(true);
                                        }}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700"
                                        onClick={async () => {
                                            if (!confirm("Xóa campaign này?")) return;
                                            try {
                                                await marketingCampaignService.delete(campaign.id);
                                                toast.success("Đã xóa");
                                                loadCampaigns();
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
                    <CampaignModal
                        campaign={editingCampaign}
                        onClose={() => {
                            setOpenForm(false);
                            setEditingCampaign(null);
                        }}
                        onSuccess={loadCampaigns}
                    />
                )}
            </div>
        </div>
    );
}

function CampaignModal({ campaign, onClose, onSuccess }: any) {
    const [formData, setFormData] = useState({
        name: campaign?.name || "",
        segmentId: campaign?.segmentId || "",
        templateId: campaign?.templateId || "",
        status: campaign?.status || "DRAFT",
        scheduledAt: campaign?.scheduledAt ? new Date(campaign.scheduledAt).toISOString().slice(0, 16) : "",
    });
    const [loading, setLoading] = useState(false);
    const [segments, setSegments] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    useEffect(() => {
        Promise.all([
            customerSegmentService.list().then((r: any) => Array.isArray(r) ? r : (r?.items || [])),
            notificationTemplateService.list().then((r: any) => Array.isArray(r) ? r : (r?.items || []))
        ]).then(([s, t]) => {
            setSegments(s);
            setTemplates(t);
        });
    }, []);

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
        
        // Validate required fields
        if (!formData.segmentId) {
            toast.error("Vui lòng chọn segment");
            return;
        }
        if (!formData.templateId) {
            toast.error("Vui lòng chọn template");
            return;
        }
        
        // Validate status
        if (!['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'].includes(formData.status)) {
            toast.error("Trạng thái không hợp lệ");
            return;
        }
        
        // Validate scheduled date if provided
        if (formData.scheduledAt) {
            const scheduled = new Date(formData.scheduledAt);
            const now = new Date();
            if (scheduled < now) {
                toast.error("Ngày lên lịch phải lớn hơn thời gian hiện tại");
                return;
            }
            
            // Validate not too far in future (max 1 year)
            const oneYearLater = new Date();
            oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
            if (scheduled > oneYearLater) {
                toast.error("Ngày lên lịch không được quá 1 năm trong tương lai");
                return;
            }
        }
        
        try {
            setLoading(true);
            const payload = {
                ...formData,
                name: formData.name.trim(),
                scheduledAt: formData.scheduledAt || undefined,
            };
            if (campaign) {
                await marketingCampaignService.update(campaign.id, payload);
                toast.success("Đã cập nhật");
            } else {
                await marketingCampaignService.create(payload);
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
                    {campaign ? "Sửa Campaign" : "Thêm Campaign"}
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
                        <label className="block text-sm text-slate-300">Segment</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.segmentId}
                            onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                            required
                        >
                            <option value="">Chọn segment</option>
                            {segments.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Template</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.templateId}
                            onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                            required
                        >
                            <option value="">Chọn template</option>
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Status</label>
                        <select
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="DRAFT">DRAFT</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-300">Scheduled At</label>
                        <input
                            type="datetime-local"
                            className="input-dark mt-1 w-full border p-2 rounded"
                            value={formData.scheduledAt}
                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
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
                            {loading ? "Đang xử lý..." : campaign ? "Cập nhật" : "Tạo"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


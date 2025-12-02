"use client";

import { useEffect, useMemo, useState } from "react";
import { useCustomer } from "@/hooks/useCustomer";
import { billingService } from "@/services/billing.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { CalendarClock, FileText, Receipt, Wallet } from "lucide-react";

interface Invoice {
    id: string;
    invoiceNo: string;
    status: string;
    totalAmount: number;
    surchargeTotal?: number;
    discountTotal?: number;
    depositApplied?: number;
    booking?: any;
    createdAt?: string;
    customerId?: string;
}

export default function UserInvoicesPage() {
    const { customer, loading: customerLoading } = useCustomer();
    const { formatVND } = useFormatVND();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selected, setSelected] = useState<Invoice | null>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [surcharges, setSurcharges] = useState<any[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [payForm, setPayForm] = useState({
        amount: "",
        method: "CASH",
        referenceNo: "",
        note: ""
    });
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        if (customerLoading) return;
        if (!customer) {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);
                const res = await billingService.invoices();
                const items: Invoice[] = Array.isArray(res) ? res : res?.items || [];
                const filtered = items.filter((i) => i.customerId === customer.id);
                setInvoices(filtered);
            } catch (err: any) {
                setError(err?.message || "Không thể tải hóa đơn");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [customer, customerLoading]);

    const statusColor = useMemo(
        () => ({
            PAID: "bg-emerald-500/20 text-emerald-200",
            UNPAID: "bg-yellow-500/20 text-yellow-200",
            PARTIAL: "bg-blue-500/20 text-blue-200",
        }),
        []
    );

    const openDetail = async (inv: Invoice) => {
        setSelected(inv);
        setDetailLoading(true);
        setPayments([]);
        setSurcharges([]);
        setPayForm((f) => ({ ...f, amount: inv.totalAmount?.toString() || "" }));
        try {
            const [p, s] = await Promise.all([
                billingService.payments(inv.id),
                billingService.surcharges(inv.id),
            ]);
            setPayments(Array.isArray(p) ? p : p?.items || []);
            setSurcharges(Array.isArray(s) ? s : s?.items || []);
        } catch (err) {
            console.error(err);
        } finally {
            setDetailLoading(false);
        }
    };

    const handlePay = async () => {
        if (!selected) return;
        if (!payForm.amount) return;
        try {
            setPaying(true);
            await billingService.pay({
                invoiceId: selected.id,
                amount: Number(payForm.amount),
                method: payForm.method,
                referenceNo: payForm.referenceNo || undefined,
                note: payForm.note || undefined,
            });
            await openDetail(selected);
        } catch (err) {
            console.error(err);
        } finally {
            setPaying(false);
        }
    };

    if (customerLoading || loading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center">
                <div className="loader" />
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-blue-100 flex items-center justify-center px-4">
                <div className="max-w-lg text-center space-y-3">
                    <h1 className="text-2xl font-semibold text-white">Bạn cần hồ sơ khách hàng</h1>
                    <p className="text-blue-100">Vui lòng cập nhật hồ sơ để xem hóa đơn & thanh toán.</p>
                    <a
                        href="/user/profile"
                        className="inline-block px-5 py-3 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                    >
                        Đi tới hồ sơ
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-6xl mx-auto px-4 py-14 space-y-10">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Hóa đơn & Thanh toán</p>
                    <h1 className="text-4xl font-bold">Quản lý thanh toán của bạn</h1>
                    <p className="text-blue-100">Theo dõi hóa đơn, phụ phí và thanh toán nhanh chóng.</p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error}
                    </div>
                )}

                {invoices.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-blue-100">
                        Chưa có hóa đơn nào. Đặt xe để xem hóa đơn tại đây.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {invoices.map((inv) => (
                            <div
                                key={inv.id}
                                className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1f36] via-[#0b1424] to-[#0b1f3a] p-5 shadow-2xl cursor-pointer hover:-translate-y-0.5 transition"
                                onClick={() => openDetail(inv)}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-blue-100 text-sm">
                                            <FileText className="w-4 h-4" />
                                            <span>{inv.invoiceNo || "Hóa đơn"}</span>
                                        </div>
                                        <h3 className="text-2xl font-bold">{formatVND(inv.totalAmount)}</h3>
                                        <div className="flex flex-wrap gap-2 text-sm text-blue-100">
                                            <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                                <CalendarClock className="w-4 h-4" />{" "}
                                                {inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("vi-VN") : "--"}
                                            </span>
                                            {inv.booking?.bookingCode && (
                                                <span className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
                                                    <Receipt className="w-4 h-4" /> {inv.booking.bookingCode}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            // @ts-ignore
                                            statusColor[inv.status] || "bg-white/10 text-white"
                                        }`}
                                    >
                                        {inv.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selected && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center px-4" onClick={() => setSelected(null)}>
                    <div
                        className="max-w-4xl w-full bg-[#0c1f36] border border-white/10 rounded-2xl p-6 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Hóa đơn</p>
                                <h2 className="text-2xl font-bold">{selected.invoiceNo}</h2>
                                <p className="text-blue-100">
                                    Tổng: <span className="text-white font-semibold">{formatVND(selected.totalAmount)}</span>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl"
                            >
                                ×
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                            <InfoCard
                                icon={<Wallet className="w-5 h-5" />}
                                title="Thanh toán"
                                body={
                                    <div className="space-y-1 text-blue-100 text-sm">
                                        <p>Đã áp dụng cọc: {formatVND(selected.depositApplied || 0)}</p>
                                        <p>Phụ phí: {formatVND(selected.surchargeTotal || 0)}</p>
                                        <p>Giảm giá: {formatVND(selected.discountTotal || 0)}</p>
                                        <p>Trạng thái: {selected.status}</p>
                                    </div>
                                }
                            />
                            <InfoCard
                                icon={<FileText className="w-5 h-5" />}
                                title="Đặt xe"
                                body={
                                    <div className="space-y-1 text-blue-100 text-sm">
                                        <p>Mã booking: {selected.booking?.bookingCode || "—"}</p>
                                        <p>Xe: {selected.booking?.vehicle?.name || "—"}</p>
                                        <p>Chi nhánh: {selected.booking?.branch?.name || "—"}</p>
                                    </div>
                                }
                            />
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Receipt className="w-5 h-5 text-blue-200" />
                                    <p className="font-semibold">Thanh toán</p>
                                </div>
                                {detailLoading ? (
                                    <div className="text-blue-100 text-sm">Đang tải...</div>
                                ) : payments.length === 0 ? (
                                    <p className="text-blue-100 text-sm">Chưa có thanh toán.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {payments.map((p) => (
                                            <div key={p.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-blue-100">
                                                <p className="font-semibold text-white">{formatVND(p.amount)}</p>
                                                <p>Phương thức: {p.method}</p>
                                                {p.referenceNo && <p>Ref: {p.referenceNo}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4 space-y-2">
                                    <p className="text-sm uppercase tracking-[0.12em] text-blue-200">Thanh toán thêm</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <input
                                            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40"
                                            placeholder="Số tiền"
                                            value={payForm.amount}
                                            onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })}
                                        />
                                        <select
                                            className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white focus:outline-none focus:border-white/40"
                                            value={payForm.method}
                                            onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}
                                        >
                                            <option value="CASH">Tiền mặt</option>
                                            <option value="BANK">Chuyển khoản</option>
                                            <option value="CARD">Thẻ</option>
                                        </select>
                                    </div>
                                    <input
                                        className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40 w-full"
                                        placeholder="Mã tham chiếu (tuỳ chọn)"
                                        value={payForm.referenceNo}
                                        onChange={(e) => setPayForm({ ...payForm, referenceNo: e.target.value })}
                                    />
                                    <input
                                        className="px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-white placeholder:text-blue-200 focus:outline-none focus:border-white/40 w-full"
                                        placeholder="Ghi chú"
                                        value={payForm.note}
                                        onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
                                    />
                                    <button
                                        onClick={handlePay}
                                        disabled={paying}
                                        className="w-full py-3 mt-2 rounded-lg bg-white text-[#0b1f3a] font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
                                    >
                                        {paying ? "Đang thanh toán..." : "Thanh toán"}
                                    </button>
                                </div>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <CalendarClock className="w-5 h-5 text-blue-200" />
                                    <p className="font-semibold">Phụ phí</p>
                                </div>
                                {detailLoading ? (
                                    <div className="text-blue-100 text-sm">Đang tải...</div>
                                ) : surcharges.length === 0 ? (
                                    <p className="text-blue-100 text-sm">Chưa có phụ phí.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {surcharges.map((s) => (
                                            <div key={s.id} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-blue-100">
                                                <p className="font-semibold text-white">{s.name}</p>
                                                <p>Số tiền: {formatVND(s.amount)}</p>
                                                {s.description && <p>Lý do: {s.description}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <p className="font-semibold">{title}</p>
            </div>
            {body}
        </div>
    );
}


"use client";

import { useEffect, useState, useMemo } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { billingService } from "@/services/billing.service";
import { branchService } from "@/services/branch.service";
import { FileText, DollarSign, CreditCard, Wallet, TrendingUp, Calendar, Building2, Filter } from "lucide-react";
import { useFormatVND } from "@/hooks/useFormatVND";
import { translateStatus } from "@/lib/utils";

export default function AdminInvoicesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const { formatVND } = useFormatVND();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
    const [openModal, setOpenModal] = useState(false);
    
    // Branch filter
    const [branches, setBranches] = useState<any[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>("all");
    const [showBranchStats, setShowBranchStats] = useState(false);
    
    // Revenue statistics
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalPaid: 0,
        totalUnpaid: 0,
        totalCash: 0,
        totalStripe: 0,
        totalSurcharges: 0,
        totalDiscounts: 0,
        totalDeposits: 0,
        paidCount: 0,
        unpaidCount: 0
    });
    
    // Branch statistics
    const [branchStats, setBranchStats] = useState<Record<string, {
        name: string;
        totalRevenue: number;
        totalPaid: number;
        totalUnpaid: number;
        totalCash: number;
        totalStripe: number;
        invoiceCount: number;
        paidCount: number;
    }>>({});

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadBranches() {
            try {
                const res = await branchService.getAll({ limit: 100 });
                const data = res?.data || res;
                const items = data?.items || (Array.isArray(data) ? data : []);
                setBranches(items);
            } catch (err) {
                console.error("Load branches failed:", err);
            }
        }

        loadBranches();
    }, [user, userLoading]);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        async function loadInvoices() {
            try {
                setLoading(true);
                const res = await billingService.getAllInvoices({ limit: 1000 });
                const data = res?.data || res;
                const items = data?.items || (Array.isArray(data) ? data : []);
                const totalCount = data?.total || items.length;
                setInvoices(items);
                setTotal(totalCount);
                
                // Calculate statistics
                let totalRevenue = 0;
                let totalPaid = 0;
                let totalUnpaid = 0;
                let totalCash = 0;
                let totalStripe = 0;
                let totalSurcharges = 0;
                let totalDiscounts = 0;
                let totalDeposits = 0;
                let paidCount = 0;
                let unpaidCount = 0;
                
                items.forEach((inv: any) => {
                    totalRevenue += inv.totalAmount || 0;
                    totalSurcharges += inv.surchargeTotal || 0;
                    totalDiscounts += inv.discountTotal || 0;
                    totalDeposits += inv.depositApplied || 0;
                    
                    const payments = inv.payments || [];
                    const paymentsTotal = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                    
                    if (inv.status === 'PAID' || paymentsTotal >= inv.totalAmount) {
                        totalPaid += inv.totalAmount || 0;
                        paidCount++;
                    } else {
                        totalUnpaid += (inv.totalAmount || 0) - paymentsTotal;
                        unpaidCount++;
                    }
                    
                    payments.forEach((p: any) => {
                        if (p.method === 'CASH') {
                            totalCash += p.amount || 0;
                        } else if (p.method === 'STRIPE' || p.method === 'ONLINE') {
                            totalStripe += p.amount || 0;
                        }
                    });
                });
                
                setStats({
                    totalRevenue,
                    totalPaid,
                    totalUnpaid,
                    totalCash,
                    totalStripe,
                    totalSurcharges,
                    totalDiscounts,
                    totalDeposits,
                    paidCount,
                    unpaidCount
                });
                
                // Calculate branch statistics
                const branchStatsMap: Record<string, {
                    name: string;
                    totalRevenue: number;
                    totalPaid: number;
                    totalUnpaid: number;
                    totalCash: number;
                    totalStripe: number;
                    invoiceCount: number;
                    paidCount: number;
                }> = {};
                
                items.forEach((inv: any) => {
                    const branchId = inv.booking?.branchId || inv.branchId || 'unknown';
                    const branchName = inv.booking?.branch?.name || inv.branch?.name || 'Không xác định';
                    
                    if (!branchStatsMap[branchId]) {
                        branchStatsMap[branchId] = {
                            name: branchName,
                            totalRevenue: 0,
                            totalPaid: 0,
                            totalUnpaid: 0,
                            totalCash: 0,
                            totalStripe: 0,
                            invoiceCount: 0,
                            paidCount: 0
                        };
                    }
                    
                    const branchStat = branchStatsMap[branchId];
                    branchStat.invoiceCount++;
                    branchStat.totalRevenue += inv.totalAmount || 0;
                    
                    const payments = inv.payments || [];
                    const paymentsTotal = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                    
                    if (inv.status === 'PAID' || paymentsTotal >= inv.totalAmount) {
                        branchStat.totalPaid += inv.totalAmount || 0;
                        branchStat.paidCount++;
                    } else {
                        branchStat.totalUnpaid += (inv.totalAmount || 0) - paymentsTotal;
                    }
                    
                    payments.forEach((p: any) => {
                        if (p.method === 'CASH') {
                            branchStat.totalCash += p.amount || 0;
                        } else if (p.method === 'STRIPE' || p.method === 'ONLINE') {
                            branchStat.totalStripe += p.amount || 0;
                        }
                    });
                });
                
                setBranchStats(branchStatsMap);
            } catch (err) {
                console.error("Load invoices failed:", err);
                setError("Không thể tải danh sách hóa đơn");
            } finally {
                setLoading(false);
            }
        }

        loadInvoices();
    }, [user, userLoading]);

    // Filter invoices by branch and calculate filtered stats
    const filteredInvoices = useMemo(() => {
        if (selectedBranchId === "all") return invoices;
        return invoices.filter((invoice) => {
            const branchId = invoice.booking?.branchId || invoice.branchId;
            return branchId === selectedBranchId;
        });
    }, [invoices, selectedBranchId]);

    const filteredStats = useMemo(() => {
        let totalRevenue = 0;
        let totalPaid = 0;
        let totalUnpaid = 0;
        let totalCash = 0;
        let totalStripe = 0;
        let totalSurcharges = 0;
        let totalDiscounts = 0;
        let totalDeposits = 0;
        let paidCount = 0;
        let unpaidCount = 0;

        filteredInvoices.forEach((inv: any) => {
            totalRevenue += inv.totalAmount || 0;
            totalSurcharges += inv.surchargeTotal || 0;
            totalDiscounts += inv.discountTotal || 0;
            totalDeposits += inv.depositApplied || 0;

            const payments = inv.payments || [];
            const paymentsTotal = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

            if (inv.status === 'PAID' || paymentsTotal >= inv.totalAmount) {
                totalPaid += inv.totalAmount || 0;
                paidCount++;
            } else {
                totalUnpaid += (inv.totalAmount || 0) - paymentsTotal;
                unpaidCount++;
            }

            payments.forEach((p: any) => {
                if (p.method === 'CASH') {
                    totalCash += p.amount || 0;
                } else if (p.method === 'STRIPE' || p.method === 'ONLINE') {
                    totalStripe += p.amount || 0;
                }
            });
        });

        return {
            totalRevenue,
            totalPaid,
            totalUnpaid,
            totalCash,
            totalStripe,
            totalSurcharges,
            totalDiscounts,
            totalDeposits,
            paidCount,
            unpaidCount,
            invoiceCount: filteredInvoices.length
        };
    }, [filteredInvoices]);

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
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                            Danh Sách Hóa Đơn
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">
                            Quản lý tất cả hóa đơn trong hệ thống
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Branch Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-slate-400" />
                            <select
                                value={selectedBranchId}
                                onChange={(e) => setSelectedBranchId(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả chi nhánh</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <button
                            onClick={() => setShowBranchStats(!showBranchStats)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition"
                        >
                            <Building2 className="w-4 h-4" />
                            {showBranchStats ? "Ẩn" : "Xem"} doanh thu theo chi nhánh
                        </button>

                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">
                            {selectedBranchId === "all" ? "Tổng hóa đơn" : "Hóa đơn đang hiển thị"}
                        </p>
                        <p className="text-lg font-semibold text-blue-400">
                            {filteredStats.invoiceCount.toLocaleString("vi-VN")}
                            {selectedBranchId !== "all" && (
                                <span className="text-xs text-slate-500 ml-1">/ {total}</span>
                            )}
                        </p>
                    </div>
                    </div>
                </div>

                {/* Branch Statistics */}
                {showBranchStats && (
                    <div className="mb-6 rounded-xl border border-slate-700 bg-slate-900/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-400" />
                                Doanh Thu Theo Chi Nhánh
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(branchStats).map(([branchId, stat]) => (
                                <div
                                    key={branchId}
                                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 hover:bg-slate-800/70 transition"
                                >
                                    <h3 className="text-lg font-semibold text-white mb-3">{stat.name}</h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Tổng doanh thu:</span>
                                            <span className="text-emerald-400 font-bold">{formatVND(stat.totalRevenue)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Đã thanh toán:</span>
                                            <span className="text-blue-400 font-semibold">{formatVND(stat.totalPaid)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Còn lại:</span>
                                            <span className="text-yellow-400 font-semibold">{formatVND(stat.totalUnpaid)}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-700 mt-2">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-slate-400 text-xs">Tiền mặt:</span>
                                                <span className="text-purple-400 text-xs font-semibold">{formatVND(stat.totalCash)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-xs">Stripe:</span>
                                                <span className="text-blue-400 text-xs font-semibold">{formatVND(stat.totalStripe)}</span>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t border-slate-700 mt-2">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 text-xs">Số hóa đơn:</span>
                                                <span className="text-white text-xs font-semibold">{stat.invoiceCount} ({stat.paidCount} đã thanh toán)</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Revenue Dashboard */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs text-slate-400">Tổng doanh thu</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalRevenue : filteredStats.totalRevenue)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {filteredStats.invoiceCount} hóa đơn
                            {selectedBranchId !== "all" && (
                                <span className="text-slate-500"> (đã lọc)</span>
                            )}
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <span className="text-xs text-slate-400">Đã thanh toán</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalPaid : filteredStats.totalPaid)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {filteredStats.paidCount} hóa đơn đã thanh toán
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <Wallet className="w-5 h-5 text-yellow-400" />
                            <span className="text-xs text-slate-400">Còn lại</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalUnpaid : filteredStats.totalUnpaid)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {filteredStats.unpaidCount} hóa đơn chưa thanh toán
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <CreditCard className="w-5 h-5 text-purple-400" />
                            <span className="text-xs text-slate-400">Tiền mặt</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalCash : filteredStats.totalCash)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            Stripe: {formatVND(selectedBranchId === "all" ? stats.totalStripe : filteredStats.totalStripe)}
                        </p>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Phí phát sinh</p>
                        <p className="text-lg font-semibold text-yellow-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalSurcharges : filteredStats.totalSurcharges)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Giảm giá</p>
                        <p className="text-lg font-semibold text-blue-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalDiscounts : filteredStats.totalDiscounts)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
                        <p className="text-xs text-slate-400 mb-1">Tiền cọc áp dụng</p>
                        <p className="text-lg font-semibold text-purple-400">
                            {formatVND(selectedBranchId === "all" ? stats.totalDeposits : filteredStats.totalDeposits)}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Invoices Grid */}
                {invoices.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                        <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400">Chưa có hóa đơn nào trong hệ thống.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredInvoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setOpenModal(true);
                                }}
                                className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                                           hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 
                                           transition-all duration-200"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        <span className="text-sm font-semibold text-blue-400">
                                            {invoice.invoiceNo || "—"}
                                        </span>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${
                                        invoice.status === "PAID" ? "bg-emerald-500/20 text-emerald-400" :
                                        invoice.status === "UNPAID" ? "bg-yellow-500/20 text-yellow-400" :
                                        "bg-slate-500/20 text-slate-400"
                                    }`}>
                                        {translateStatus(invoice.status || "UNPAID", 'invoice')}
                                    </span>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Khách hàng:</span> {invoice.customer?.fullName || "—"}
                                    </p>
                                    <p className="text-gray-300">
                                        <span className="text-slate-500">Booking:</span> {invoice.booking?.bookingCode || "—"}
                                    </p>
                                    {invoice.booking?.branch && (
                                        <p className="text-gray-300">
                                            <span className="text-slate-500">Chi nhánh:</span> {invoice.booking.branch.name || "—"}
                                        </p>
                                    )}
                                    <p className="text-lg font-bold text-emerald-400">
                                        {invoice.totalAmount?.toLocaleString("vi-VN")} đ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {openModal && selectedInvoice && (
                    <div className="fixed inset-0 z-[999] flex bg-black/75 backdrop-blur-sm" onClick={() => setOpenModal(false)}>
                        <div className="m-auto max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        Chi Tiết Hóa Đơn
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        Mã: {selectedInvoice.invoiceNo || "—"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setOpenModal(false)}
                                    className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6 text-sm">
                                {/* Status & Basic Info */}
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                        <p className="text-slate-400 mb-1">Trạng thái</p>
                                    <p className={`text-lg font-semibold ${
                                        selectedInvoice.status === "PAID" ? "text-emerald-400" :
                                        selectedInvoice.status === "UNPAID" ? "text-yellow-400" :
                                        "text-slate-400"
                                    }`}>
                                        {translateStatus(selectedInvoice.status || "UNPAID", 'invoice')}
                                    </p>
                                </div>
                                <div>
                                        <p className="text-slate-400 mb-1">Ngày tạo</p>
                                        <p className="text-white">
                                            {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleDateString("vi-VN", {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : "—"}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                    <p className="text-slate-400 mb-2">Khách hàng</p>
                                    <p className="text-white font-semibold">{selectedInvoice.customer?.fullName || "—"}</p>
                                    <p className="text-slate-400 text-xs mt-1">{selectedInvoice.customer?.phone || "—"}</p>
                                    <p className="text-slate-400 text-xs">{selectedInvoice.customer?.email || "—"}</p>
                                </div>

                                {/* Booking Info */}
                                {selectedInvoice.booking && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-2">Thông tin đặt xe</p>
                                        <p className="text-white font-semibold">Booking: {selectedInvoice.booking.bookingCode || "—"}</p>
                                        {selectedInvoice.booking.vehicle && (
                                            <p className="text-slate-300 text-xs mt-1">
                                                Xe: {selectedInvoice.booking.vehicle.name} ({selectedInvoice.booking.vehicle.licensePlate})
                                            </p>
                                        )}
                                        {selectedInvoice.booking.pickupDate && (
                                            <p className="text-slate-400 text-xs mt-1">
                                                Nhận: {new Date(selectedInvoice.booking.pickupDate).toLocaleDateString("vi-VN")} - 
                                                Trả: {new Date(selectedInvoice.booking.returnDate).toLocaleDateString("vi-VN")}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Financial Breakdown */}
                                <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                    <p className="text-slate-400 mb-3 font-semibold">Phân tích tài chính</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-300">Tổng phụ (Subtotal):</span>
                                            <span className="text-white font-semibold">{formatVND(selectedInvoice.subtotal || 0)}</span>
                                        </div>
                                        {selectedInvoice.surchargeTotal > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Phí phát sinh:</span>
                                                <span className="text-yellow-400 font-semibold">+{formatVND(selectedInvoice.surchargeTotal)}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.discountTotal > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Giảm giá:</span>
                                                <span className="text-blue-400 font-semibold">-{formatVND(selectedInvoice.discountTotal)}</span>
                                            </div>
                                        )}
                                        {selectedInvoice.depositApplied > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">Tiền cọc áp dụng:</span>
                                                <span className="text-purple-400 font-semibold">-{formatVND(selectedInvoice.depositApplied)}</span>
                                            </div>
                                        )}
                                        {(selectedInvoice.vatAmount || 0) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-300">VAT ({selectedInvoice.vatPercent || 0}%):</span>
                                                <span className="text-slate-300 font-semibold">+{formatVND(selectedInvoice.vatAmount || 0)}</span>
                                            </div>
                                        )}
                                        <div className="pt-2 border-t border-slate-700 flex justify-between">
                                            <span className="text-slate-300 font-semibold">Tổng cộng:</span>
                                            <span className="text-emerald-400 text-xl font-bold">{formatVND(selectedInvoice.totalAmount || 0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payments */}
                                {selectedInvoice.payments && Array.isArray(selectedInvoice.payments) && selectedInvoice.payments.length > 0 && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-3 font-semibold">Lịch sử thanh toán ({selectedInvoice.payments.length})</p>
                                        <div className="space-y-2">
                                            {selectedInvoice.payments.map((payment: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 rounded-lg p-3 flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                payment.method === 'CASH' ? 'bg-purple-500/20 text-purple-400' :
                                                                payment.method === 'STRIPE' || payment.method === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-slate-500/20 text-slate-400'
                                                            }`}>
                                                                {payment.method === 'CASH' ? 'Tiền mặt' : payment.method === 'STRIPE' || payment.method === 'ONLINE' ? 'Stripe' : payment.method}
                                                            </span>
                                                            {payment.referenceNo && (
                                                                <span className="text-xs text-slate-500">Mã: {payment.referenceNo}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">
                                                            {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString("vi-VN", {
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            }) : payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("vi-VN") : "—"}
                                                        </p>
                                                        {payment.note && (
                                                            <p className="text-xs text-slate-500 mt-1">{payment.note}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-emerald-400 font-bold text-lg">
                                                        {formatVND(payment.amount || 0)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-slate-700">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-300">Tổng đã thanh toán:</span>
                                                <span className="text-blue-400 font-bold">
                                                    {formatVND(selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0))}
                                                </span>
                                            </div>
                                            {selectedInvoice.totalAmount && (
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className="text-slate-300">Còn lại:</span>
                                                    <span className={`font-bold ${
                                                        (selectedInvoice.totalAmount - selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)) > 0 
                                                            ? "text-yellow-400" : "text-emerald-400"
                                                    }`}>
                                                        {formatVND(Math.max(0, selectedInvoice.totalAmount - selectedInvoice.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)))}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Surcharges */}
                                {selectedInvoice.surcharges && Array.isArray(selectedInvoice.surcharges) && selectedInvoice.surcharges.length > 0 && (
                                    <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                                        <p className="text-slate-400 mb-3 font-semibold">Phí phát sinh ({selectedInvoice.surcharges.length})</p>
                                        <div className="space-y-2">
                                            {selectedInvoice.surcharges.map((s: any, idx: number) => (
                                                <div key={idx} className="bg-slate-800/50 rounded-lg p-3">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-white font-semibold">{s.name}</span>
                                                        <span className="text-yellow-400 font-bold">{formatVND(s.amount || 0)}</span>
                                                    </div>
                                                    {s.description && (
                                                        <p className="text-xs text-slate-400">{s.description}</p>
                                                    )}
                                                    {s.occurredAt && (
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Xảy ra: {new Date(s.occurredAt).toLocaleDateString("vi-VN")}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

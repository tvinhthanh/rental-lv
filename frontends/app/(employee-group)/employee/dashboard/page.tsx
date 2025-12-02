"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { bookingService } from "@/services/booking.service";
import { rentalProcessService } from "@/services/rental-process.service";
import { billingService } from "@/services/billing.service";
import { vehicleService } from "@/services/vehicle.service";
import { maintenanceService } from "@/services/maintenance.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function EmployeeDashboardPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Statistics
    const [stats, setStats] = useState({
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        revenue: 0,
        availableVehicles: 0,
        maintenanceVehicles: 0,
        rentedVehicles: 0,
        totalContracts: 0,
        totalHandovers: 0,
        totalReturns: 0,
    });

    // Load data
    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") {
            setLoading(false);
            return;
        }

        async function loadData() {
            try {
                setLoading(true);

                // Load employee
                const empRes = await employeeService.getUser(user.id);
                const empData = empRes?.data || empRes;
                setEmployee(empData);

                if (!empData?.branchId) {
                    setLoading(false);
                    return;
                }

                // Load all data in parallel
                const [
                    bookingsRes,
                    vehiclesRes,
                    maintenancesRes,
                    contractsRes,
                    handoversRes,
                    returnsRes,
                    invoicesRes,
                ] = await Promise.all([
                    bookingService.getByBranch(empData.branchId).catch(() => ({ items: [], total: 0 })),
                    vehicleService.getByBranch(empData.branchId).catch(() => []),
                    maintenanceService.getByBranch(empData.branchId).catch(() => []),
                    rentalProcessService.contractsByBranch(empData.branchId).catch(() => ({ items: [], total: 0 })),
                    rentalProcessService.handoversByBranch(empData.branchId).catch(() => ({ items: [], total: 0 })),
                    rentalProcessService.returnsByBranch(empData.branchId).catch(() => ({ items: [], total: 0 })),
                    billingService.invoicesByBranch(empData.branchId).catch(() => ({ items: [], total: 0 })),
                ]);

                // Process bookings
                const bookings = Array.isArray(bookingsRes?.items) 
                    ? bookingsRes.items 
                    : (Array.isArray(bookingsRes) ? bookingsRes : []);
                const totalBookings = bookingsRes?.total || bookings.length;
                const completedBookings = bookings.filter((b: any) => 
                    b.status === "COMPLETED"
                ).length;
                const pendingBookings = bookings.filter((b: any) => 
                    b.status === "PENDING"
                ).length;

                // Process vehicles
                const vehicles = Array.isArray(vehiclesRes?.data) 
                    ? vehiclesRes.data 
                    : (Array.isArray(vehiclesRes) ? vehiclesRes : []);
                const availableVehicles = vehicles.filter((v: any) => 
                    v.status === "AVAILABLE"
                ).length;
                const rentedVehicles = vehicles.filter((v: any) => 
                    v.status === "RENTED" || v.status === "ONGOING"
                ).length;

                // Process maintenances
                const maintenances = Array.isArray(maintenancesRes?.data) 
                    ? maintenancesRes.data 
                    : (Array.isArray(maintenancesRes) ? maintenancesRes : []);
                const activeMaintenances = maintenances.filter((m: any) => 
                    m.status === "IN_PROGRESS" || m.status === "PENDING" || !m.completedAt
                ).length;

                // Process contracts
                const contracts = Array.isArray(contractsRes?.items) 
                    ? contractsRes.items 
                    : (Array.isArray(contractsRes) ? contractsRes : []);
                const totalContracts = contractsRes?.total || contracts.length;

                // Process handovers
                const handovers = Array.isArray(handoversRes?.items) 
                    ? handoversRes.items 
                    : (Array.isArray(handoversRes) ? handoversRes : []);
                const totalHandovers = handoversRes?.total || handovers.length;

                // Process returns
                const returns = Array.isArray(returnsRes?.items) 
                    ? returnsRes.items 
                    : (Array.isArray(returnsRes) ? returnsRes : []);
                const totalReturns = returnsRes?.total || returns.length;

                // Calculate revenue from invoices
                const invoices = Array.isArray(invoicesRes?.items) 
                    ? invoicesRes.items 
                    : (Array.isArray(invoicesRes) ? invoicesRes : []);
                const revenue = invoices.reduce((sum: number, inv: any) => {
                    // Calculate paid amount from payments
                    if (inv.payments && Array.isArray(inv.payments)) {
                        const paidAmount = inv.payments.reduce((pSum: number, p: any) => 
                            pSum + (p.amount || 0), 0
                        );
                        return sum + paidAmount;
                    }
                    // If invoice is PAID, use totalAmount
                    if (inv.status === "PAID" && inv.totalAmount) {
                        return sum + inv.totalAmount;
                    }
                    return sum;
                }, 0);

                setStats({
                    totalBookings,
                    completedBookings,
                    pendingBookings,
                    revenue,
                    availableVehicles,
                    maintenanceVehicles: activeMaintenances,
                    rentedVehicles,
                    totalContracts,
                    totalHandovers,
                    totalReturns,
                });

            } catch (err) {
                console.error("Load dashboard data failed:", err);
                setError("Không thể tải dữ liệu dashboard");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [user, userLoading]);

    // Guards
    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "EMPLOYEE") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Không tìm thấy dữ liệu nhân viên.</p>
            </div>
        );
    }

    if (!employee.branchId) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-yellow-400">Bạn chưa được phân công vào chi nhánh nào.</p>
            </div>
        );
    }

    const completionRate = stats.totalBookings > 0 
        ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
        : 0;

    // Chart data
    const vehicleChartData = [
        { name: "Đang Rảnh", value: stats.availableVehicles },
        { name: "Đang Thuê", value: stats.rentedVehicles },
        { name: "Bảo Dưỡng", value: stats.maintenanceVehicles },
    ];

    const bookingStatusData = [
        { name: "Hoàn Thành", value: stats.completedBookings },
        { name: "Chờ Tiếp Nhận", value: stats.pendingBookings },
        { name: "Đang Xử Lý", value: stats.totalBookings - stats.completedBookings - stats.pendingBookings },
    ];

    const processChartData = [
        { name: "Hợp Đồng", value: stats.totalContracts },
        { name: "Phiếu Nhận", value: stats.totalHandovers },
        { name: "Phiếu Trả", value: stats.totalReturns },
    ];

    const COLORS = {
        available: "#10b981", // green-500
        rented: "#a855f7", // purple-500
        maintenance: "#f59e0b", // amber-500
        completed: "#3b82f6", // blue-500
        pending: "#f59e0b", // amber-500
        processing: "#6366f1", // indigo-500
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                        Dashboard Nhân Viên
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Chi nhánh: <span className="text-blue-400">{employee.branch?.name || employee.branchId}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                    {/* Hoàn thành / Tổng đơn */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Đơn Hàng</p>
                        <p className="text-3xl font-bold text-blue-400 mb-1">
                            {stats.completedBookings} / {stats.totalBookings}
                        </p>
                        <p className="text-sm text-slate-400">
                            Tỷ lệ hoàn thành: {completionRate}%
                        </p>
                    </div>

                    {/* Doanh thu */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Doanh Thu</p>
                        <p className="text-3xl font-bold text-emerald-400 mb-1">
                            {stats.revenue.toLocaleString("vi-VN")} đ
                        </p>
                        <p className="text-sm text-slate-400">
                            Tổng đã thanh toán
                        </p>
                    </div>

                    {/* Xe đang trong */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Xe Đang Trong</p>
                        <p className="text-3xl font-bold text-green-400 mb-1">
                            {stats.availableVehicles}
                        </p>
                        <p className="text-sm text-slate-400">
                            Xe sẵn sàng cho thuê
                        </p>
                    </div>

                    {/* Xe đang bảo dưỡng */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Xe Bảo Dưỡng</p>
                        <p className="text-3xl font-bold text-yellow-400 mb-1">
                            {stats.maintenanceVehicles}
                        </p>
                        <p className="text-sm text-slate-400">
                            Đang trong quá trình bảo dưỡng
                        </p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Vehicle Status Chart */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">Trạng Thái Xe</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={vehicleChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    style={{ fontSize: "12px" }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: "#1e293b", 
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                        color: "#e2e8f0"
                                    }}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="value" 
                                    fill="#10b981"
                                    radius={[8, 8, 0, 0]}
                                >
                                    {vehicleChartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={
                                                entry.name === "Đang Rảnh" ? COLORS.available :
                                                entry.name === "Đang Thuê" ? COLORS.rented :
                                                COLORS.maintenance
                                            } 
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Booking Status Pie Chart */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">Trạng Thái Booking</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={bookingStatusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {bookingStatusData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={
                                                entry.name === "Hoàn Thành" ? COLORS.completed :
                                                entry.name === "Chờ Tiếp Nhận" ? COLORS.pending :
                                                COLORS.processing
                                            } 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: "#1e293b", 
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                        color: "#e2e8f0"
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Process Chart */}
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">Quy Trình Thuê Xe</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={processChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94a3b8"
                                    style={{ fontSize: "12px" }}
                                />
                                <YAxis 
                                    stroke="#94a3b8"
                                    style={{ fontSize: "12px" }}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: "#1e293b", 
                                        border: "1px solid #334155",
                                        borderRadius: "8px",
                                        color: "#e2e8f0"
                                    }}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="value" 
                                    fill="#6366f1"
                                    radius={[8, 8, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Additional Stats */}
                <div className="grid gap-6 md:grid-cols-3 mt-6">
                    {/* Xe đang được thuê */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Xe Đang Thuê</p>
                        <p className="text-3xl font-bold text-purple-400 mb-1">
                            {stats.rentedVehicles}
                        </p>
                        <p className="text-sm text-slate-400">
                            Xe đang được khách thuê
                        </p>
                    </div>

                    {/* Booking chờ tiếp nhận */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-amber-900/30 to-yellow-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Booking Chờ</p>
                        <p className="text-3xl font-bold text-amber-400 mb-1">
                            {stats.pendingBookings}
                        </p>
                        <p className="text-sm text-slate-400">
                            Đơn đang chờ tiếp nhận
                        </p>
                    </div>

                    {/* Hợp đồng đã làm */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Hợp Đồng</p>
                        <p className="text-3xl font-bold text-cyan-400 mb-1">
                            {stats.totalContracts}
                        </p>
                        <p className="text-sm text-slate-400">
                            Tổng hợp đồng đã tạo
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

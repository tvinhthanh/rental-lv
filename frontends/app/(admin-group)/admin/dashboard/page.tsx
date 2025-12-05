"use client";

import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { bookingService } from "@/services/booking.service";
import { vehicleService } from "@/services/vehicle.service";
import { customerService } from "@/services/customer.service";
import { employeeService } from "@/services/employee.service";
import { branchService } from "@/services/branch.service";
import { billingService } from "@/services/billing.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboardPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [showCharts, setShowCharts] = useState(false);

    // Load statistics with React Query for caching
    const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ["admin-dashboard-stats"],
        queryFn: async () => {
            // Load essential data with limits to improve performance
            const [
                bookingsRes,
                vehiclesRes,
                customersRes,
                employeesRes,
                branchesRes,
                invoicesRes,
            ] = await Promise.all([
                bookingService.list({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                vehicleService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                customerService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                employeeService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                branchService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                billingService.getAllInvoices({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
            ]);

            // Process bookings
            const bookings = bookingsRes?.items || bookingsRes?.data?.items || [];
            const totalBookings = bookingsRes?.total || bookingsRes?.data?.total || bookings.length;
            const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED").length;
            const pendingBookings = bookings.filter((b: any) => b.status === "PENDING").length;
            const ongoingBookings = bookings.filter((b: any) => b.status === "ONGOING" || b.status === "CONFIRMED").length;

            // Process vehicles
            const vehicles = vehiclesRes?.items || vehiclesRes?.data?.items || [];
            const totalVehicles = vehiclesRes?.total || vehiclesRes?.data?.total || vehicles.length;
            const availableVehicles = vehicles.filter((v: any) => v.status === "AVAILABLE").length;
            const rentedVehicles = vehicles.filter((v: any) => v.status === "RENTED" || v.status === "ONGOING").length;
            const maintenanceVehicles = vehicles.filter((v: any) => v.status === "MAINTENANCE").length;

            // Process customers
            const customers = customersRes?.items || customersRes?.data?.items || [];
            const totalCustomers = customersRes?.total || customersRes?.data?.total || customers.length;

            // Process employees
            const employees = employeesRes?.items || employeesRes?.data?.items || [];
            const totalEmployees = employeesRes?.total || employeesRes?.data?.total || employees.length;

            // Process branches
            const branches = branchesRes?.items || branchesRes?.data?.items || [];
            const totalBranches = branchesRes?.total || branchesRes?.data?.total || branches.length;
            const activeBranches = branches.filter((b: any) => b.isActive !== false).length;

            // Calculate revenue from invoices
            const invoices = invoicesRes?.items || invoicesRes?.data?.items || [];
            const revenue = invoices.reduce((sum: number, inv: any) => {
                if (inv.payments && Array.isArray(inv.payments)) {
                    const paidAmount = inv.payments.reduce((pSum: number, p: any) => 
                        pSum + (p.amount || 0), 0
                    );
                    return sum + paidAmount;
                }
                if (inv.status === "PAID" && inv.totalAmount) {
                    return sum + inv.totalAmount;
                }
                return sum;
            }, 0);

            return {
                totalBookings,
                completedBookings,
                pendingBookings,
                ongoingBookings,
                revenue,
                totalVehicles,
                availableVehicles,
                maintenanceVehicles,
                rentedVehicles,
                totalCustomers,
                totalEmployees,
                totalBranches,
                activeBranches,
            };
        },
        enabled: !userLoading,
        staleTime: 2 * 60 * 1000, // Cache for 2 minutes
        refetchOnWindowFocus: false,
    });

    // Lazy load charts after initial render
    useEffect(() => {
        if (!statsLoading && statsData) {
            const timer = setTimeout(() => setShowCharts(true), 100);
            return () => clearTimeout(timer);
        }
    }, [statsLoading, statsData]);

    const stats = statsData || {
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        ongoingBookings: 0,
        revenue: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        maintenanceVehicles: 0,
        rentedVehicles: 0,
        totalCustomers: 0,
        totalEmployees: 0,
        totalBranches: 0,
        activeBranches: 0,
    };

    const loading = userLoading || statsLoading;

    // Guards
    if (loading) {
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

    const completionRate = useMemo(() => 
        stats.totalBookings > 0 
            ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
            : 0,
        [stats.totalBookings, stats.completedBookings]
    );

    // Chart data - memoized for performance
    const vehicleChartData = useMemo(() => [
        { name: "Đang Rảnh", value: stats.availableVehicles },
        { name: "Đang Thuê", value: stats.rentedVehicles },
        { name: "Bảo Dưỡng", value: stats.maintenanceVehicles },
    ], [stats.availableVehicles, stats.rentedVehicles, stats.maintenanceVehicles]);

    const bookingStatusData = useMemo(() => [
        { name: "Hoàn Thành", value: stats.completedBookings },
        { name: "Chờ Xử Lý", value: stats.pendingBookings },
        { name: "Đang Thuê", value: stats.ongoingBookings },
    ], [stats.completedBookings, stats.pendingBookings, stats.ongoingBookings]);

    const COLORS = {
        available: "#10b981",
        rented: "#a855f7",
        maintenance: "#f59e0b",
        completed: "#3b82f6",
        pending: "#f59e0b",
        ongoing: "#6366f1",
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                        Dashboard Quản Trị
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-400">
                        Tổng quan hệ thống và thống kê
                    </p>
                </div>

                {statsError && (
                    <div className="mb-3 sm:mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-300">
                        Lỗi khi tải dữ liệu
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Tổng đơn hàng */}
                    <div className="rounded-lg sm:rounded-xl border border-slate-800 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-4 sm:p-5 md:p-6">
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Tổng Đơn Hàng</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                            {stats.totalBookings}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Hoàn thành: {stats.completedBookings} ({completionRate}%)
                        </p>
                    </div>

                    {/* Doanh thu */}
                    <div className="rounded-lg sm:rounded-xl border border-slate-800 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-4 sm:p-5 md:p-6">
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Doanh Thu</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1 break-words">
                            {stats.revenue.toLocaleString("vi-VN")} đ
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Tổng đã thanh toán
                        </p>
                    </div>

                    {/* Tổng xe */}
                    <div className="rounded-lg sm:rounded-xl border border-slate-800 bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-4 sm:p-5 md:p-6">
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Tổng Xe</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                            {stats.totalVehicles}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Sẵn sàng: {stats.availableVehicles}
                        </p>
                    </div>

                    {/* Khách hàng */}
                    <div className="rounded-lg sm:rounded-xl border border-slate-800 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 sm:p-5 md:p-6">
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Khách Hàng</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
                            {stats.totalCustomers}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Tổng số khách hàng
                        </p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Nhân viên */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Nhân Viên</p>
                        <p className="text-3xl font-bold text-cyan-400 mb-1">
                            {stats.totalEmployees}
                        </p>
                        <p className="text-sm text-slate-400">
                            Tổng số nhân viên
                        </p>
                    </div>

                    {/* Chi nhánh */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-orange-900/30 to-amber-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Chi Nhánh</p>
                        <p className="text-3xl font-bold text-orange-400 mb-1">
                            {stats.activeBranches} / {stats.totalBranches}
                        </p>
                        <p className="text-sm text-slate-400">
                            Chi nhánh đang hoạt động
                        </p>
                    </div>

                    {/* Xe đang thuê */}
                    <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-violet-900/30 to-purple-900/30 p-6">
                        <p className="text-xs uppercase text-slate-400 mb-2">Xe Đang Thuê</p>
                        <p className="text-3xl font-bold text-violet-400 mb-1">
                            {stats.rentedVehicles}
                        </p>
                        <p className="text-sm text-slate-400">
                            Xe đang được khách thuê
                        </p>
                    </div>

                    {/* Xe bảo dưỡng */}
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

                {/* Charts Grid - Lazy loaded */}
                {showCharts ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Vehicle Status Chart */}
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
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
                        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
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
                                                    entry.name === "Chờ Xử Lý" ? COLORS.pending :
                                                    COLORS.ongoing
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
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 h-[380px] flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

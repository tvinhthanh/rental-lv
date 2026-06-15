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
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from "recharts";
import { ChevronLeft, ChevronRight, FileCheck } from "lucide-react";

export default function AdminDashboardPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [showCharts, setShowCharts] = useState(false);
    const [chartError, setChartError] = useState<string | null>(null);
    const [showVehicleModal, setShowVehicleModal] = useState<'with-docs' | 'without-docs' | null>(null);
    const [modalVehicles, setModalVehicles] = useState<any[]>([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState<'bookings' | 'customers' | 'employees' | 'branches' | 'vehicles' | 'invoices' | null>(null);
    const [modalData, setModalData] = useState<any[]>([]);
    const [modalDetailLoading, setModalDetailLoading] = useState(false);
    const [docSlide, setDocSlide] = useState(0);
    const [chartSlide, setChartSlide] = useState(0);

    // Load statistics with React Query for caching
    const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
        queryKey: ["admin-dashboard-stats"],
        queryFn: async () => {
            // Load essential data with limits to improve performance
            const [
                bookingsRes,
                vehiclesAllRes, // Tất cả xe (admin view)
                vehiclesWithDocsRes, // Xe có document (user view)
                customersRes,
                employeesRes,
                branchesRes,
                invoicesRes,
            ] = await Promise.all([
                bookingService.list({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                vehicleService.getAll({ limit: 100, skipDocumentCheck: 'true' }).catch(() => ({ items: [], total: 0 })),
                vehicleService.getAll({ limit: 100, skipDocumentCheck: 'false' }).catch(() => ({ items: [], total: 0 })), // Xe có document
                customerService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                employeeService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                branchService.getAll({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
                billingService.getAllInvoices({ limit: 100 }).catch(() => ({ items: [], total: 0 })),
            ]);

            // Process bookings - handle both direct response and wrapped response
            const bookingsData = bookingsRes?.data || bookingsRes;
            const bookings = bookingsData?.items || (Array.isArray(bookingsData) ? bookingsData : []);
            const totalBookings = bookingsData?.total || bookings.length;
            const completedBookings = bookings.filter((b: any) => b?.status === "COMPLETED").length;
            const pendingBookings = bookings.filter((b: any) => b?.status === "PENDING").length;
            const ongoingBookings = bookings.filter((b: any) => b?.status === "ONGOING" || b?.status === "CONFIRMED").length;

            // Process vehicles (all vehicles - admin view)
            const vehiclesAllData = vehiclesAllRes?.data || vehiclesAllRes;
            const vehicles = vehiclesAllData?.items || (Array.isArray(vehiclesAllData) ? vehiclesAllData : []);
            const totalVehicles = vehiclesAllData?.total || vehicles.length;
            const availableVehicles = vehicles.filter((v: any) => v?.status === "AVAILABLE").length;
            const rentedVehicles = vehicles.filter((v: any) => v?.status === "RENTED" || v?.status === "ONGOING").length;
            const maintenanceVehicles = vehicles.filter((v: any) => v?.status === "MAINTENANCE").length;

            // Process vehicles with documents
            // Dùng kết quả từ API call với skipDocumentCheck: 'false'
            const vehiclesWithDocsData = vehiclesWithDocsRes?.data || vehiclesWithDocsRes;
            const vehiclesWithDocuments = vehiclesWithDocsData?.items || (Array.isArray(vehiclesWithDocsData) ? vehiclesWithDocsData : []);
            
            // Lấy số lượng từ API response - ưu tiên total, sau đó items.length
            let vehiclesWithDocumentsCount = 0;
            if (vehiclesWithDocsData && typeof vehiclesWithDocsData === 'object' && 'total' in vehiclesWithDocsData) {
                vehiclesWithDocumentsCount = Number(vehiclesWithDocsData.total) || 0;
            } else if (Array.isArray(vehiclesWithDocsData)) {
                vehiclesWithDocumentsCount = vehiclesWithDocsData.length;
            } else if (vehiclesWithDocuments.length > 0) {
                vehiclesWithDocumentsCount = vehiclesWithDocuments.length;
            }
            // Nếu vẫn là 0, có thể API call thất bại hoặc không có xe nào có document
            
            const totalVehiclesNum = Number(totalVehicles) || 0;
            const vehiclesWithoutDocuments = Math.max(0, totalVehiclesNum - vehiclesWithDocumentsCount);

            // Process customers
            const customersData = customersRes?.data || customersRes;
            const customers = customersData?.items || (Array.isArray(customersData) ? customersData : []);
            const totalCustomers = customersData?.total || customers.length;

            // Process employees
            const employeesData = employeesRes?.data || employeesRes;
            const employees = employeesData?.items || (Array.isArray(employeesData) ? employeesData : []);
            const totalEmployees = employeesData?.total || employees.length;

            // Process branches
            const branchesData = branchesRes?.data || branchesRes;
            const branches = branchesData?.items || (Array.isArray(branchesData) ? branchesData : []);
            const totalBranches = branchesData?.total || branches.length;
            const activeBranches = branches.filter((b: any) => b?.isActive !== false).length;

            // Calculate revenue from invoices
            const invoicesData = invoicesRes?.data || invoicesRes;
            const invoices = invoicesData?.items || (Array.isArray(invoicesData) ? invoicesData : []);
            const revenue = invoices.reduce((sum: number, inv: any) => {
                if (!inv) return sum;
                if (inv.payments && Array.isArray(inv.payments)) {
                    const paidAmount = inv.payments.reduce((pSum: number, p: any) => 
                        pSum + (p?.amount || 0), 0
                    );
                    return sum + paidAmount;
                }
                if (inv.status === "PAID" && inv.totalAmount) {
                    return sum + (inv.totalAmount || 0);
                }
                return sum;
            }, 0);

            // Prepare detailed data for charts
            // Bookings by month (last 6 months)
            const bookingsByMonth = Array.from({ length: 6 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const monthStr = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                const count = bookings.filter((b: any) => {
                    const bookingDate = b.createdAt ? new Date(b.createdAt) : null;
                    return bookingDate && bookingDate >= monthStart && bookingDate <= monthEnd;
                }).length;
                return { month: monthStr, bookings: count };
            });

            // Vehicles by branch
            const vehiclesByBranch = branches.map((branch: any) => {
                const branchVehicles = vehicles.filter((v: any) => v.branchId === branch.id);
                return {
                    name: branch.name || branch.id,
                    vehicles: branchVehicles.length,
                    available: branchVehicles.filter((v: any) => v.status === "AVAILABLE").length,
                };
            });

            // Revenue by month (from invoices)
            const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (5 - i));
                const monthStr = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                const monthRevenue = invoices.reduce((sum: number, inv: any) => {
                    const invDate = inv.createdAt ? new Date(inv.createdAt) : null;
                    if (!invDate || invDate < monthStart || invDate > monthEnd) return sum;
                    if (inv.payments && Array.isArray(inv.payments)) {
                        return sum + inv.payments.reduce((pSum: number, p: any) => pSum + (p?.amount || 0), 0);
                    }
                    if (inv.status === "PAID" && inv.totalAmount) {
                        return sum + (inv.totalAmount || 0);
                    }
                    return sum;
                }, 0);
                return { month: monthStr, revenue: monthRevenue };
            });

            // Employees by branch
            const employeesByBranch = branches.map((branch: any) => {
                const branchEmployees = employees.filter((e: any) => e.branchId === branch.id);
                return {
                    name: branch.name || branch.id,
                    employees: branchEmployees.length,
                };
            });

            return {
                totalBookings: Number(totalBookings) || 0,
                completedBookings: Number(completedBookings) || 0,
                pendingBookings: Number(pendingBookings) || 0,
                ongoingBookings: Number(ongoingBookings) || 0,
                revenue: Number(revenue) || 0,
                totalVehicles: totalVehiclesNum,
                availableVehicles: Number(availableVehicles) || 0,
                maintenanceVehicles: Number(maintenanceVehicles) || 0,
                rentedVehicles: Number(rentedVehicles) || 0,
                vehiclesWithDocuments: vehiclesWithDocumentsCount,
                vehiclesWithoutDocuments: vehiclesWithoutDocuments,
                totalCustomers: Number(totalCustomers) || 0,
                totalEmployees: Number(totalEmployees) || 0,
                totalBranches: Number(totalBranches) || 0,
                activeBranches: Number(activeBranches) || 0,
                bookingsByMonth,
                vehiclesByBranch,
                revenueByMonth,
                employeesByBranch,
                // Store vehicles data for modal
                allVehicles: vehicles,
                vehiclesWithDocumentsList: vehiclesWithDocuments,
            };
        },
        enabled: !userLoading && !!user && user.role === "ADMIN", // ⚡ Chỉ chạy khi đã auth và là ADMIN
        staleTime: 2 * 60 * 1000, // Cache for 2 minutes
        refetchOnWindowFocus: false,
    });

    // Lazy load charts after initial render
    useEffect(() => {
        if (!statsLoading && statsData && typeof window !== 'undefined') {
            try {
                const timer = setTimeout(() => setShowCharts(true), 100);
                return () => clearTimeout(timer);
            } catch (error: any) {
                Promise.resolve().then(() => setChartError(error?.message || 'Lỗi khi tải charts'));
            }
        }
    }, [statsLoading, statsData]);

    const stats = useMemo(() => statsData || {
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        ongoingBookings: 0,
        revenue: 0,
        totalVehicles: 0,
        availableVehicles: 0,
        maintenanceVehicles: 0,
        rentedVehicles: 0,
        vehiclesWithDocuments: 0,
        vehiclesWithoutDocuments: 0,
        totalCustomers: 0,
        totalEmployees: 0,
        totalBranches: 0,
        activeBranches: 0,
        bookingsByMonth: [],
        vehiclesByBranch: [],
        revenueByMonth: [],
        employeesByBranch: [],
        allVehicles: [],
        vehiclesWithDocumentsList: [],
    }, [statsData]);

    // Handler để mở modal và load danh sách xe
    const handleOpenVehicleModal = async (type: 'with-docs' | 'without-docs') => {
        setShowVehicleModal(type);
        setModalLoading(true);
        setModalVehicles([]);

        try {
            if (type === 'with-docs') {
                // Load xe có document
                const res = await vehicleService.getAll({ limit: 1000, skipDocumentCheck: 'false' });
                const data = res?.data || res;
                const vehicles = data?.items || (Array.isArray(data) ? data : []);
                setModalVehicles(vehicles);
            } else {
                // Load tất cả xe, sau đó filter ra xe không có document
                const allRes = await vehicleService.getAll({ limit: 1000, skipDocumentCheck: 'true' });
                const allData = allRes?.data || allRes;
                const allVehicles = allData?.items || (Array.isArray(allData) ? allData : []);
                
                const withDocsRes = await vehicleService.getAll({ limit: 1000, skipDocumentCheck: 'false' });
                const withDocsData = withDocsRes?.data || withDocsRes;
                const withDocsVehicles = withDocsData?.items || (Array.isArray(withDocsData) ? withDocsData : []);
                const withDocsIds = new Set(withDocsVehicles.map((v: any) => v.id));
                
                const withoutDocs = allVehicles.filter((v: any) => !withDocsIds.has(v.id));
                setModalVehicles(withoutDocs);
            }
        } catch (error) {
            console.error('Failed to load vehicles:', error);
        } finally {
            setModalLoading(false);
        }
    };

    // Handler để mở modal chi tiết cho các stat cards
    const handleOpenDetailModal = async (type: 'bookings' | 'customers' | 'employees' | 'branches' | 'vehicles' | 'invoices') => {
        setShowDetailModal(type);
        setModalDetailLoading(true);
        setModalData([]);

        try {
            let res: any;
            switch (type) {
                case 'bookings':
                    res = await bookingService.list({ limit: 1000 });
                    break;
                case 'customers':
                    res = await customerService.getAll({ limit: 1000 });
                    break;
                case 'employees':
                    res = await employeeService.getAll({ limit: 1000 });
                    break;
                case 'branches':
                    res = await branchService.getAll({ limit: 1000 });
                    break;
                case 'vehicles':
                    res = await vehicleService.getAll({ limit: 1000, skipDocumentCheck: 'true' });
                    break;
                case 'invoices':
                    res = await billingService.getAllInvoices({ limit: 1000 });
                    break;
            }
            const data = res?.data || res;
            const items = data?.items || (Array.isArray(data) ? data : []);
            setModalData(items);
        } catch (error) {
            console.error(`Failed to load ${type}:`, error);
        } finally {
            setModalDetailLoading(false);
        }
    };

    // ⚡ ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
    const completionRate = useMemo(() => 
        stats.totalBookings > 0 
            ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
            : 0,
        [stats.totalBookings, stats.completedBookings]
    );

    // Chart data - memoized for performance
    const vehicleChartData = useMemo(() => {
        const data = [
            { name: "Đang Rảnh", value: stats.availableVehicles || 0 },
            { name: "Đang Thuê", value: stats.rentedVehicles || 0 },
            { name: "Bảo Dưỡng", value: stats.maintenanceVehicles || 0 },
        ];
        return data.filter(d => d.value > 0).length > 0 ? data : [{ name: "Chưa có dữ liệu", value: 1 }];
    }, [stats.availableVehicles, stats.rentedVehicles, stats.maintenanceVehicles]);

    const bookingStatusData = useMemo(() => {
        const data = [
            { name: "Hoàn Thành", value: stats.completedBookings || 0 },
            { name: "Chờ Xử Lý", value: stats.pendingBookings || 0 },
            { name: "Đang Thuê", value: stats.ongoingBookings || 0 },
        ];
        return data.filter(d => d.value > 0).length > 0 ? data : [{ name: "Chưa có dữ liệu", value: 1 }];
    }, [stats.completedBookings, stats.pendingBookings, stats.ongoingBookings]);

    const COLORS = useMemo(() => ({
        available: "#10b981",
        rented: "#a855f7",
        maintenance: "#f59e0b",
        completed: "#3b82f6",
        pending: "#f59e0b",
        ongoing: "#6366f1",
    }), []);

    const chartTabs = useMemo(() => [
        {
            label: "Trạng Thái Xe",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Phân Tích Trạng Thái Hoạt Động Của Xe</h4>
                    <ResponsiveContainer width="100%" height={320}>
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
                                name="Số lượng xe"
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
            )
        },
        {
            label: "Trạng Thái Booking",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Tỷ Lệ Trạng Thái Đơn Đặt Xe</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={bookingStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                outerRadius={90}
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
            )
        },
        {
            label: "Đơn Hàng",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Biến Động Số Lượng Đơn Đặt Xe Theo Tháng</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={stats.bookingsByMonth || []}>
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                                dataKey="month" 
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
                            <Area 
                                type="monotone" 
                                dataKey="bookings" 
                                stroke="#3b82f6" 
                                fillOpacity={1} 
                                fill="url(#colorBookings)" 
                                name="Đơn hàng"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )
        },
        {
            label: "Doanh Thu",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Biểu Đồ Tăng Trưởng Doanh Thu Hàng Tháng</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={stats.revenueByMonth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                                dataKey="month" 
                                stroke="#94a3b8"
                                style={{ fontSize: "12px" }}
                            />
                            <YAxis 
                                stroke="#94a3b8"
                                style={{ fontSize: "12px" }}
                                tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: "#1e293b", 
                                    border: "1px solid #334155",
                                    borderRadius: "8px",
                                    color: "#e2e8f0"
                                }}
                                formatter={(value: any) => `${value.toLocaleString('vi-VN')} đ`}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                stroke="#10b981" 
                                strokeWidth={2.5}
                                dot={{ fill: "#10b981", r: 5 }}
                                name="Doanh thu"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )
        },
        {
            label: "Xe / Chi Nhánh",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Phân Bổ Và Trạng Thái Xe Tại Các Chi Nhánh</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats.vehiclesByBranch || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8"
                                style={{ fontSize: "12px" }}
                                angle={-30}
                                textAnchor="end"
                                height={70}
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
                            <Bar dataKey="vehicles" fill="#6366f1" radius={[6, 6, 0, 0]} name="Tổng xe" />
                            <Bar dataKey="available" fill="#10b981" radius={[6, 6, 0, 0]} name="Sẵn sàng" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        },
        {
            label: "NV / Chi Nhánh",
            component: (
                <div className="animate-fadeIn">
                    <h4 className="text-sm font-semibold text-slate-300 mb-4">Phân Bổ Nhân Sự Tại Các Chi Nhánh</h4>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={stats.employeesByBranch || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8"
                                style={{ fontSize: "12px" }}
                                angle={-30}
                                textAnchor="end"
                                height={70}
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
                            <Bar dataKey="employees" fill="#06b6d4" radius={[8, 8, 0, 0]} name="Nhân viên" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )
        }
    ], [stats, vehicleChartData, bookingStatusData, COLORS]);

    const loading = userLoading || statsLoading;

    // Guards - AFTER all hooks
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    // ⚡ Guard: Không cho render nếu chưa đăng nhập hoặc không phải ADMIN
    if (!user || user.role !== "ADMIN") {
        // Layout sẽ handle redirect, nhưng đảm bảo không render data
        return null;
    }



    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
                {/* Header */}
                <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md">
                            Dashboard Quản Trị
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-400">
                            Tổng quan hệ thống và thống kê
                        </p>
                    </div>
                    {/* Export buttons will be added when backend API is ready */}
                </div>

                {(statsError || chartError) && (
                    <div className="mb-3 sm:mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-red-300">
                        {statsError ? 'Lỗi khi tải dữ liệu' : chartError || 'Lỗi khi hiển thị biểu đồ'}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Tổng đơn hàng */}
                    <div 
                        onClick={() => handleOpenDetailModal('bookings')}
                        className="rounded-lg sm:rounded-xl border-2 border-blue-500/30 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-4 sm:p-5 md:p-6 cursor-pointer hover:border-blue-400/50 hover:bg-blue-900/40 transition-all shadow-lg hover:shadow-blue-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Tổng Đơn Hàng</p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1">
                            {stats.totalBookings}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Hoàn thành: {stats.completedBookings} ({completionRate}%)
                        </p>
                        <p className="text-xs text-blue-400/60 mt-1 italic">Click để xem chi tiết →</p>
                    </div>

                    {/* Doanh thu */}
                    <div 
                        onClick={() => handleOpenDetailModal('invoices')}
                        className="rounded-lg sm:rounded-xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 p-4 sm:p-5 md:p-6 cursor-pointer hover:border-emerald-400/50 hover:bg-emerald-900/40 transition-all shadow-lg hover:shadow-emerald-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Doanh Thu</p>
                        <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mb-1 break-words">
                            {stats.revenue.toLocaleString("vi-VN")} đ
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Tổng đã thanh toán
                        </p>
                        <p className="text-xs text-emerald-400/60 mt-1 italic">Click để xem chi tiết →</p>
                    </div>

                    {/* Tổng xe */}
                    <div 
                        onClick={() => handleOpenDetailModal('vehicles')}
                        className="rounded-lg sm:rounded-xl border-2 border-green-500/30 bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-4 sm:p-5 md:p-6 cursor-pointer hover:border-green-400/50 hover:bg-green-900/40 transition-all shadow-lg hover:shadow-green-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Tổng Xe</p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-400 mb-1">
                            {stats.totalVehicles}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Sẵn sàng: {stats.availableVehicles}
                        </p>
                        <p className="text-xs text-green-400/60 mt-1 italic">Click để xem chi tiết →</p>
                    </div>

                    {/* Khách hàng */}
                    <div 
                        onClick={() => handleOpenDetailModal('customers')}
                        className="rounded-lg sm:rounded-xl border-2 border-purple-500/30 bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 sm:p-5 md:p-6 cursor-pointer hover:border-purple-400/50 hover:bg-purple-900/40 transition-all shadow-lg hover:shadow-purple-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-1 sm:mb-2">Khách Hàng</p>
                        <p className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1">
                            {stats.totalCustomers}
                        </p>
                        <p className="text-xs sm:text-sm text-slate-400">
                            Tổng số khách hàng
                        </p>
                        <p className="text-xs text-purple-400/60 mt-1 italic">Click để xem chi tiết →</p>
                    </div>
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
                    {/* Nhân viên */}
                    <div 
                        onClick={() => handleOpenDetailModal('employees')}
                        className="rounded-xl border-2 border-cyan-500/30 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-6 cursor-pointer hover:border-cyan-400/50 hover:bg-cyan-900/40 transition-all shadow-lg hover:shadow-cyan-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-2">Nhân Viên</p>
                        <p className="text-3xl font-bold text-cyan-400 mb-1">
                            {stats.totalEmployees}
                        </p>
                        <p className="text-sm text-slate-400">
                            Tổng số nhân viên
                        </p>
                        <p className="text-xs text-cyan-400/60 mt-1 italic">Click để xem chi tiết →</p>
                    </div>

                    {/* Chi nhánh */}
                    <div 
                        onClick={() => handleOpenDetailModal('branches')}
                        className="rounded-xl border-2 border-orange-500/30 bg-gradient-to-br from-orange-900/30 to-amber-900/30 p-6 cursor-pointer hover:border-orange-400/50 hover:bg-orange-900/40 transition-all shadow-lg hover:shadow-orange-500/10"
                    >
                        <p className="text-xs uppercase text-slate-400 mb-2">Chi Nhánh</p>
                        <p className="text-3xl font-bold text-orange-400 mb-1">
                            {stats.activeBranches} / {stats.totalBranches}
                        </p>
                        <p className="text-sm text-slate-400">
                            Chi nhánh đang hoạt động
                        </p>
                        <p className="text-xs text-orange-400/60 mt-1 italic">Click để xem chi tiết →</p>
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

                {/* Vehicle Document Stats Slideshow */}
                <div className="mb-6 sm:mb-8 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 sm:p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/60">
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-cyan-400" />
                                Hồ Sơ & Giấy Tờ Xe
                            </h3>
                            <p className="text-xs text-slate-400">Xem thống kê tình trạng pháp lý xe</p>
                        </div>
                        {/* Dot indicator/Controls */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setDocSlide((prev) => (prev === 0 ? 1 : 0))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95"
                                title="Chuyển slide"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDocSlide((prev) => (prev === 1 ? 0 : 1))}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition active:scale-95"
                                title="Chuyển slide"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="relative min-h-[180px]">
                        {/* Slide 1: Xe Sẵn Sàng (Có Document) */}
                        {docSlide === 0 && (
                            <div 
                                onClick={() => handleOpenVehicleModal('with-docs')}
                                className="animate-fadeIn rounded-xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-900/40 to-teal-900/40 p-6 cursor-pointer hover:border-emerald-400 hover:bg-emerald-900/50 transition-all shadow-lg hover:shadow-emerald-500/20"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs uppercase text-emerald-300 font-semibold tracking-wider">Xe Sẵn Sàng</p>
                                    <span className="px-2.5 py-1 bg-emerald-500/30 text-emerald-200 text-xs rounded-full font-semibold">✓ Có Document</span>
                                </div>
                                <p className="text-4xl font-black text-emerald-300 mb-1">
                                    {stats.vehiclesWithDocuments || 0}
                                </p>
                                <p className="text-sm text-emerald-200/80 mb-3">
                                    Xe đã có đầy đủ giấy tờ, sẵn sàng cho thuê
                                </p>
                                <div className="mt-3 pt-3 border-t border-emerald-700/50 flex justify-between items-center text-xs text-emerald-300/70">
                                    <span>
                                        Tỷ lệ: {(() => {
                                            const total = Number(stats.totalVehicles) || 0;
                                            const withDocs = Number(stats.vehiclesWithDocuments) || 0;
                                            return total > 0 ? ((withDocs / total) * 100).toFixed(1) : '0.0';
                                        })()}% tổng số xe
                                    </span>
                                    <span className="text-emerald-400/60 italic font-medium">Click để xem chi tiết →</span>
                                </div>
                            </div>
                        )}

                        {/* Slide 2: Xe Chưa Có Document */}
                        {docSlide === 1 && (
                            <div 
                                onClick={() => handleOpenVehicleModal('without-docs')}
                                className="animate-fadeIn rounded-xl border-2 border-orange-500/50 bg-gradient-to-br from-orange-900/40 to-amber-900/40 p-6 cursor-pointer hover:border-orange-400 hover:bg-orange-900/50 transition-all shadow-lg hover:shadow-orange-500/20"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs uppercase text-orange-300 font-semibold tracking-wider">Xe Chưa Có Document</p>
                                    <span className="px-2.5 py-1 bg-orange-500/30 text-orange-200 text-xs rounded-full font-semibold">⚠ Cần Bổ Sung</span>
                                </div>
                                <p className="text-4xl font-black text-orange-300 mb-1">
                                    {stats.vehiclesWithoutDocuments || 0}
                                </p>
                                <p className="text-sm text-orange-200/80 mb-3">
                                    Xe chưa có đầy đủ giấy tờ, chưa thể cho thuê
                                </p>
                                <div className="mt-3 pt-3 border-t border-orange-700/50 flex justify-between items-center text-xs text-orange-300/70">
                                    <span>
                                        Tỷ lệ: {(() => {
                                            const total = Number(stats.totalVehicles) || 0;
                                            const withoutDocs = Number(stats.vehiclesWithoutDocuments) || 0;
                                            return total > 0 ? ((withoutDocs / total) * 100).toFixed(1) : '0.0';
                                        })()}% tổng số xe
                                    </span>
                                    <span className="text-orange-400/60 italic font-medium">Click để xem chi tiết →</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts Slider */}
                {showCharts && typeof window !== 'undefined' ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6 shadow-xl backdrop-blur-sm">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white">Biểu Đồ Thống Kê Hệ Thống</h3>
                                <p className="text-xs text-slate-400 mt-1">Chọn tab hoặc dùng nút chuyển đổi để xem các khía cạnh thống kê</p>
                            </div>
                            
                            {/* Navigation Tabs */}
                            <div className="flex flex-wrap gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 max-w-full">
                                {chartTabs.map((tab, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setChartSlide(idx)}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                                            chartSlide === idx
                                                ? "bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-md"
                                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Chart Slide Component */}
                        <div className="relative overflow-hidden min-h-[360px] flex flex-col justify-center">
                            {chartTabs[chartSlide].component}
                        </div>

                        {/* Slider Controls */}
                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/80">
                            <button
                                onClick={() => setChartSlide((prev) => (prev === 0 ? chartTabs.length - 1 : prev - 1))}
                                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition active:scale-95 flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Trước
                            </button>
                            
                            <button
                                onClick={() => setChartSlide((prev) => (prev === chartTabs.length - 1 ? 0 : prev + 1))}
                                className="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition active:scale-95 flex items-center gap-1"
                            >
                                Sau <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 h-[380px] flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    </div>
                )}

                {/* Vehicle List Modal */}
                {showVehicleModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowVehicleModal(null)}>
                        <div 
                            className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {showVehicleModal === 'with-docs' ? 'Xe Sẵn Sàng (Có Document)' : 'Xe Chưa Có Document'}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {showVehicleModal === 'with-docs' 
                                            ? 'Danh sách xe đã có đầy đủ giấy tờ' 
                                            : 'Danh sách xe cần bổ sung giấy tờ'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowVehicleModal(null)}
                                    className="text-slate-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {modalLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    </div>
                                ) : modalVehicles.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">
                                        <p className="text-lg">Không có xe nào</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {modalVehicles.map((vehicle: any) => (
                                            <div 
                                                key={vehicle.id}
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <h3 className="font-semibold text-white text-lg">{vehicle.name}</h3>
                                                    <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                        vehicle.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                                                        vehicle.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        vehicle.status === 'RENTED' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-red-500/20 text-red-400'
                                                    }`}>
                                                        {vehicle.status === 'AVAILABLE' ? 'Đang rảnh' :
                                                         vehicle.status === 'MAINTENANCE' ? 'Bảo dưỡng' :
                                                         vehicle.status === 'RENTED' ? 'Đang thuê' : vehicle.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                    <p className="text-slate-400">Biển số: <span className="text-white font-medium">{vehicle.licensePlate || '—'}</span></p>
                                                    <p className="text-slate-400">Mẫu: <span className="text-white font-medium">{vehicle.model || '—'}</span></p>
                                                    {vehicle.vehicleType && (
                                                        <p className="text-slate-400">Loại: <span className="text-white">{vehicle.vehicleType}</span></p>
                                                    )}
                                                    {vehicle.year && (
                                                        <p className="text-slate-400">Năm: <span className="text-white">{vehicle.year}</span></p>
                                                    )}
                                                    {vehicle.color && (
                                                        <p className="text-slate-400">Màu: <span className="text-white">{vehicle.color}</span></p>
                                                    )}
                                                    {vehicle.seatCount && (
                                                        <p className="text-slate-400">Số ghế: <span className="text-white">{vehicle.seatCount}</span></p>
                                                    )}
                                                    {vehicle.transmission && (
                                                        <p className="text-slate-400">Hộp số: <span className="text-white">{vehicle.transmission}</span></p>
                                                    )}
                                                    {vehicle.fuelType && (
                                                        <p className="text-slate-400">Nhiên liệu: <span className="text-white">{vehicle.fuelType}</span></p>
                                                    )}
                                                    {vehicle.mileage && (
                                                        <p className="text-slate-400">Số km: <span className="text-white">{vehicle.mileage.toLocaleString('vi-VN')} km</span></p>
                                                    )}
                                                    {vehicle.rating !== undefined && (
                                                        <p className="text-slate-400">Đánh giá: <span className="text-white">{vehicle.rating.toFixed(1)} ⭐ ({vehicle.reviewCount || 0})</span></p>
                                                    )}
                                                </div>
                                                <div className="pt-2 border-t border-slate-700">
                                                    {vehicle.branch && (
                                                        <p className="text-sm text-slate-400">Chi nhánh: <span className="text-white font-medium">{vehicle.branch.name || vehicle.branchId}</span></p>
                                                    )}
                                                    {vehicle.brand && (
                                                        <p className="text-sm text-slate-400">Thương hiệu: <span className="text-white">{vehicle.brand.name || vehicle.brandId || '—'}</span></p>
                                                    )}
                                                    {vehicle.category && (
                                                        <p className="text-sm text-slate-400">Danh mục: <span className="text-white">{vehicle.category.name || vehicle.categoryId || '—'}</span></p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                                <p className="text-sm text-slate-400 text-center">
                                    Tổng: {modalVehicles.length} xe
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Modal for Stats Cards */}
                {showDetailModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDetailModal(null)}>
                        <div 
                            className="bg-slate-900 rounded-2xl border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {showDetailModal === 'bookings' && 'Danh Sách Đơn Hàng'}
                                        {showDetailModal === 'customers' && 'Danh Sách Khách Hàng'}
                                        {showDetailModal === 'employees' && 'Danh Sách Nhân Viên'}
                                        {showDetailModal === 'branches' && 'Danh Sách Chi Nhánh'}
                                        {showDetailModal === 'vehicles' && 'Danh Sách Xe'}
                                        {showDetailModal === 'invoices' && 'Danh Sách Hóa Đơn'}
                                    </h2>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Tổng: {modalData.length} {
                                            showDetailModal === 'bookings' ? 'đơn hàng' :
                                            showDetailModal === 'customers' ? 'khách hàng' :
                                            showDetailModal === 'employees' ? 'nhân viên' :
                                            showDetailModal === 'branches' ? 'chi nhánh' :
                                            showDetailModal === 'vehicles' ? 'xe' :
                                            showDetailModal === 'invoices' ? 'hóa đơn' : ''
                                        }
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowDetailModal(null)}
                                    className="text-slate-400 hover:text-white text-2xl w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6">
                                {modalDetailLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                                    </div>
                                ) : modalData.length === 0 ? (
                                    <div className="text-center py-20 text-slate-400">
                                        <p className="text-lg">Không có dữ liệu</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {modalData.map((item: any) => (
                                            <div 
                                                key={item.id}
                                                className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800 transition"
                                            >
                                                {showDetailModal === 'bookings' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white">Đơn #{item.id?.slice(0, 8)}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                item.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                                                                item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                item.status === 'CONTRACTED' ? 'bg-blue-500/20 text-blue-400' :
                                                                item.status === 'ONGOING' ? 'bg-purple-500/20 text-purple-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                                {item.status === 'COMPLETED' ? 'Đã hoàn thành' :
                                                                 item.status === 'PENDING' ? 'Chờ xử lý' :
                                                                 item.status === 'CONTRACTED' ? 'Đã ký hợp đồng' :
                                                                 item.status === 'ONGOING' ? 'Đang diễn ra' :
                                                                 item.status === 'CONFIRMED' ? 'Đã xác nhận' :
                                                                 item.status === 'CANCELLED' ? 'Đã hủy' : item.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400">
                                                            Khách hàng: <span className="text-white font-medium">
                                                                {item.customer?.fullName || item.customer?.name || item.customer?.email || item.customerId || '—'}
                                                            </span>
                                                        </p>
                                                        {item.customer?.phone && (
                                                            <p className="text-sm text-slate-400">SĐT: <span className="text-white">{item.customer.phone}</span></p>
                                                        )}
                                                        <p className="text-sm text-slate-400">
                                                            Xe: <span className="text-white font-medium">{item.vehicle?.name || item.vehicleId || '—'}</span>
                                                        </p>
                                                        {item.startDate && item.endDate && (
                                                            <p className="text-sm text-slate-400">
                                                                Thời gian: <span className="text-white">
                                                                    {new Date(item.startDate).toLocaleDateString('vi-VN')} - {new Date(item.endDate).toLocaleDateString('vi-VN')}
                                                                </span>
                                                            </p>
                                                        )}
                                                        <p className="text-sm text-slate-400">
                                                            Tổng tiền: <span className="text-white font-semibold">
                                                                {item.totalAmount ? `${item.totalAmount.toLocaleString('vi-VN')} đ` : '—'}
                                                            </span>
                                                        </p>
                                                    </>
                                                )}
                                                {showDetailModal === 'customers' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h3 className="font-semibold text-white text-lg">
                                                                    {item.fullName || item.name || 'Khách hàng'}
                                                                </h3>
                                                                {item.email && (
                                                                    <p className="text-sm text-slate-400 mt-1">{item.email}</p>
                                                                )}
                                                            </div>
                                                            {item.status && (
                                                                <span className={`px-2 py-1 text-xs rounded-full ${
                                                                    item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                                    item.status === 'INACTIVE' ? 'bg-red-500/20 text-red-400' :
                                                                    'bg-gray-500/20 text-gray-400'
                                                                }`}>
                                                                    {item.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {item.phone && (
                                                                <p className="text-sm text-slate-400">
                                                                    SĐT: <span className="text-white">{item.phone}</span>
                                                                </p>
                                                            )}
                                                            {item.address && (
                                                                <p className="text-sm text-slate-400">
                                                                    Địa chỉ: <span className="text-white">{item.address}</span>
                                                                </p>
                                                            )}
                                                            {item.dateOfBirth && (
                                                                <p className="text-sm text-slate-400">
                                                                    Ngày sinh: <span className="text-white">
                                                                        {new Date(item.dateOfBirth).toLocaleDateString('vi-VN')}
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {item.gender && (
                                                                <p className="text-sm text-slate-400">
                                                                    Giới tính: <span className="text-white">
                                                                        {item.gender === 'MALE' ? 'Nam' : item.gender === 'FEMALE' ? 'Nữ' : item.gender}
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {item.idCard && (
                                                                <p className="text-sm text-slate-400">
                                                                    CMND/CCCD: <span className="text-white">{item.idCard}</span>
                                                                </p>
                                                            )}
                                                            {item.licenseNumber && (
                                                                <p className="text-sm text-slate-400">
                                                                    Bằng lái: <span className="text-white">{item.licenseNumber}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        {item.createdAt && (
                                                            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-700">
                                                                Ngày đăng ký: {new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                {showDetailModal === 'employees' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white">{item.fullName || item.name || item.email || item.id}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' :
                                                                item.status === 'INACTIVE' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                                {item.status === 'ACTIVE' ? 'Hoạt động' : item.status === 'INACTIVE' ? 'Nghỉ việc' : item.status || '—'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400">Email: {item.email || '—'}</p>
                                                        <p className="text-sm text-slate-400">SĐT: {item.phone || '—'}</p>
                                                        <p className="text-sm text-slate-400">Phòng ban: {item.department || '—'}</p>
                                                        <p className="text-sm text-slate-400">Chức vụ: {item.position || '—'}</p>
                                                        {item.salary && (
                                                            <p className="text-sm text-slate-400">Lương: {item.salary.toLocaleString('vi-VN')} đ</p>
                                                        )}
                                                        {item.hireDate && (
                                                            <p className="text-sm text-slate-400">Ngày vào làm: {new Date(item.hireDate).toLocaleDateString('vi-VN')}</p>
                                                        )}
                                                        <p className="text-sm text-slate-400">Chi nhánh: {item.branch?.name || item.branchId || '—'}</p>
                                                    </>
                                                )}
                                                {showDetailModal === 'branches' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold text-white text-lg">{item.name || item.id}</h3>
                                                                {item.code && (
                                                                    <p className="text-xs text-slate-400 mt-1">Mã: {item.code}</p>
                                                                )}
                                                            </div>
                                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                                                item.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {item.isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
                                                            </span>
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            {item.address && (
                                                                <p className="text-sm text-slate-400">
                                                                    Địa chỉ: <span className="text-white">{item.address}</span>
                                                                </p>
                                                            )}
                                                            {item.phone && (
                                                                <p className="text-sm text-slate-400">
                                                                    SĐT: <span className="text-white">{item.phone}</span>
                                                                </p>
                                                            )}
                                                            {item.email && (
                                                                <p className="text-sm text-slate-400">
                                                                    Email: <span className="text-white">{item.email}</span>
                                                                </p>
                                                            )}
                                                            {item.manager && (
                                                                <p className="text-sm text-slate-400">
                                                                    Quản lý: <span className="text-white">
                                                                        {item.manager.fullName || item.manager.name || item.manager.email || item.managerId || '—'}
                                                                    </span>
                                                                </p>
                                                            )}
                                                            {item.openingHours && (
                                                                <p className="text-sm text-slate-400">
                                                                    Giờ mở cửa: <span className="text-white">{item.openingHours}</span>
                                                                </p>
                                                            )}
                                                            {item.description && (
                                                                <p className="text-sm text-slate-400">
                                                                    Mô tả: <span className="text-white">{item.description}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        {item.createdAt && (
                                                            <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-700">
                                                                Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric'
                                                                })}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                                {showDetailModal === 'vehicles' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white">{item.name || item.id}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                item.status === 'AVAILABLE' ? 'bg-green-500/20 text-green-400' :
                                                                item.status === 'MAINTENANCE' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                item.status === 'RENTED' ? 'bg-blue-500/20 text-blue-400' :
                                                                'bg-red-500/20 text-red-400'
                                                            }`}>
                                                                {item.status === 'AVAILABLE' ? 'Đang rảnh' :
                                                                 item.status === 'MAINTENANCE' ? 'Bảo dưỡng' :
                                                                 item.status === 'RENTED' ? 'Đang thuê' : item.status}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <p className="text-slate-400">Biển số: <span className="text-white">{item.licensePlate || '—'}</span></p>
                                                            <p className="text-slate-400">Mẫu: <span className="text-white">{item.model || '—'}</span></p>
                                                            <p className="text-slate-400">Loại: <span className="text-white">{item.vehicleType || '—'}</span></p>
                                                            <p className="text-slate-400">Năm: <span className="text-white">{item.year || '—'}</span></p>
                                                            <p className="text-slate-400">Màu: <span className="text-white">{item.color || '—'}</span></p>
                                                            <p className="text-slate-400">Số ghế: <span className="text-white">{item.seatCount || '—'}</span></p>
                                                            <p className="text-slate-400">Hộp số: <span className="text-white">{item.transmission || '—'}</span></p>
                                                            <p className="text-slate-400">Nhiên liệu: <span className="text-white">{item.fuelType || '—'}</span></p>
                                                            {item.mileage && (
                                                                <p className="text-slate-400">Số km: <span className="text-white">{item.mileage.toLocaleString('vi-VN')} km</span></p>
                                                            )}
                                                            {item.rating !== undefined && (
                                                                <p className="text-slate-400">Đánh giá: <span className="text-white">{item.rating.toFixed(1)} ⭐ ({item.reviewCount || 0} đánh giá)</span></p>
                                                            )}
                                                        </div>
                                                        <div className="mt-2 pt-2 border-t border-slate-700">
                                                            <p className="text-sm text-slate-400">Chi nhánh: <span className="text-white">{item.branch?.name || item.branchId || '—'}</span></p>
                                                            {item.brand && (
                                                                <p className="text-sm text-slate-400">Thương hiệu: <span className="text-white">{item.brand.name || item.brandId || '—'}</span></p>
                                                            )}
                                                            {item.category && (
                                                                <p className="text-sm text-slate-400">Danh mục: <span className="text-white">{item.category.name || item.categoryId || '—'}</span></p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                                {showDetailModal === 'invoices' && (
                                                    <>
                                                        <div className="flex items-start justify-between mb-2">
                                                            <h3 className="font-semibold text-white">Hóa đơn #{item.id?.slice(0, 8)}</h3>
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                item.status === 'PAID' ? 'bg-green-500/20 text-green-400' :
                                                                item.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                item.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                                                                'bg-gray-500/20 text-gray-400'
                                                            }`}>
                                                                {item.status === 'PAID' ? 'Đã thanh toán' :
                                                                 item.status === 'PENDING' ? 'Chưa thanh toán' :
                                                                 item.status === 'CANCELLED' ? 'Đã hủy' : item.status}
                                                            </span>
                                                        </div>
                                                        {item.booking && (
                                                            <>
                                                                <p className="text-sm text-slate-400">
                                                                    Booking: <span className="text-white font-medium">#{item.booking.id?.slice(0, 8) || item.bookingId}</span>
                                                                </p>
                                                                {item.booking.customer && (
                                                                    <p className="text-sm text-slate-400">
                                                                        Khách hàng: <span className="text-white font-medium">
                                                                            {item.booking.customer.fullName || item.booking.customer.name || item.booking.customer.email || '—'}
                                                                        </span>
                                                                    </p>
                                                                )}
                                                                {item.booking.vehicle && (
                                                                    <p className="text-sm text-slate-400">
                                                                        Xe: <span className="text-white font-medium">{item.booking.vehicle.name || '—'}</span>
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                        {!item.booking && item.bookingId && (
                                                            <p className="text-sm text-slate-400">Booking ID: <span className="text-white">{item.bookingId}</span></p>
                                                        )}
                                                        <div className="mt-2 pt-2 border-t border-slate-700">
                                                            <p className="text-sm text-slate-400">
                                                                Tổng tiền: <span className="text-white font-semibold text-base">
                                                                    {item.totalAmount ? `${item.totalAmount.toLocaleString('vi-VN')} đ` : '—'}
                                                                </span>
                                                            </p>
                                                            {item.payments && Array.isArray(item.payments) && item.payments.length > 0 && (
                                                                <>
                                                                    <p className="text-sm text-slate-400 mt-1">
                                                                        Đã thanh toán: <span className="text-green-400 font-semibold">
                                                                            {item.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0).toLocaleString('vi-VN')} đ
                                                                        </span>
                                                                    </p>
                                                                    {item.totalAmount && (
                                                                        <p className="text-sm text-slate-400 mt-1">
                                                                            Còn lại: <span className="text-yellow-400 font-semibold">
                                                                            {Math.max(0, item.totalAmount - item.payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)).toLocaleString('vi-VN')} đ
                                                                            </span>
                                                                        </p>
                                                                    )}
                                                                </>
                                                            )}
                                                            {(!item.payments || item.payments.length === 0) && (
                                                                <p className="text-sm text-slate-400 mt-1">
                                                                    Đã thanh toán: <span className="text-red-400">0 đ</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                        {item.createdAt && (
                                                            <p className="text-xs text-slate-500 mt-2">
                                                                Ngày tạo: {new Date(item.createdAt).toLocaleDateString('vi-VN', { 
                                                                    year: 'numeric', 
                                                                    month: 'long', 
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-slate-700 bg-slate-800/30">
                                <p className="text-sm text-slate-400 text-center">
                                    Tổng: {modalData.length} {
                                        showDetailModal === 'bookings' ? 'đơn hàng' :
                                        showDetailModal === 'customers' ? 'khách hàng' :
                                        showDetailModal === 'employees' ? 'nhân viên' :
                                        showDetailModal === 'branches' ? 'chi nhánh' :
                                        showDetailModal === 'vehicles' ? 'xe' :
                                        showDetailModal === 'invoices' ? 'hóa đơn' : ''
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { branchService } from "@/services/branch.service";
import { vehicleService } from "@/services/vehicle.service";
import { maintenanceService } from "@/services/maintenance.service";

export default function InformationsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [branch, setBranch] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

                // Load branch
                try {
                    const branchRes = await branchService.get(empData.branchId);
                    setBranch(branchRes?.data || branchRes);
                } catch (err) {
                    console.error("Load branch failed:", err);
                }

                // Load vehicles by branch
                try {
                    const vehiclesRes = await vehicleService.getByBranch(empData.branchId);
                    const vehiclesData = Array.isArray(vehiclesRes?.data) 
                        ? vehiclesRes.data 
                        : (Array.isArray(vehiclesRes) ? vehiclesRes : []);
                    setVehicles(vehiclesData);
                } catch (err) {
                    console.error("Load vehicles failed:", err);
                }

                // Load maintenances by branch
                try {
                    const maintRes = await maintenanceService.getByBranch(empData.branchId);
                    const maintData = Array.isArray(maintRes?.data) 
                        ? maintRes.data 
                        : (Array.isArray(maintRes) ? maintRes : []);
                    // Filter only active/maintenance status
                    const activeMaintenances = maintData.filter((m: any) => 
                        m.status === "IN_PROGRESS" || m.status === "PENDING" || !m.completedAt
                    );
                    setMaintenances(activeMaintenances);
                } catch (err) {
                    console.error("Load maintenances failed:", err);
                }

            } catch (err) {
                console.error("Load data failed:", err);
                setError("Không thể tải dữ liệu");
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

    // Count vehicles
    const availableVehicles = vehicles.filter(v => v.status === "AVAILABLE").length;
    const maintenanceVehicles = maintenances.length;

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md">
                        Thông Tin Chi Nhánh & Nhân Viên
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Xem thông tin chi nhánh, nhân viên và thống kê xe.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg bg-red-900/30 border border-red-500/50 px-4 py-3 text-red-300">
                        {error}
                    </div>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Thông tin Chi nhánh */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
                        <h2 className="text-xl font-bold text-blue-300 mb-4">
                            Thông Tin Chi Nhánh
                        </h2>
                        <div className="space-y-3 text-sm text-slate-200">
                            <p>
                                <b className="text-slate-400">Tên chi nhánh:</b>{" "}
                                <span className="text-white font-semibold">
                                    {branch?.name || "—"}
                                </span>
                            </p>
                            <p>
                                <b className="text-slate-400">Địa chỉ:</b>{" "}
                                {branch?.address || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Điện thoại:</b>{" "}
                                {branch?.phone || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Email:</b>{" "}
                                {branch?.email || "—"}
                            </p>
                            {branch?.businessHours && (
                                <p>
                                    <b className="text-slate-400">Giờ làm việc:</b>{" "}
                                    {branch.businessHours}
                                </p>
                            )}
                            {branch?.description && (
                                <p>
                                    <b className="text-slate-400">Mô tả:</b>{" "}
                                    {branch.description}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Thông tin Nhân viên */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
                        <h2 className="text-xl font-bold text-purple-300 mb-4">
                            Thông Tin Nhân Viên
                        </h2>
                        <div className="space-y-3 text-sm text-slate-200">
                            <p>
                                <b className="text-slate-400">Họ tên:</b>{" "}
                                <span className="text-white font-semibold">
                                    {employee.fullName || "—"}
                                </span>
                            </p>
                            <p>
                                <b className="text-slate-400">Email:</b>{" "}
                                {employee.email || user.email || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Số điện thoại:</b>{" "}
                                {employee.phone || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Phòng ban:</b>{" "}
                                {employee.department || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Chức vụ:</b>{" "}
                                {employee.position || "—"}
                            </p>
                            <p>
                                <b className="text-slate-400">Trạng thái:</b>{" "}
                                <span className={
                                    employee.status === "ACTIVE" 
                                        ? "text-emerald-400 font-semibold" 
                                        : "text-slate-400"
                                }>
                                    {employee.status === "ACTIVE" ? "Đang làm việc" : employee.status || "—"}
                                </span>
                            </p>
                            {employee.hireDate && (
                                <p>
                                    <b className="text-slate-400">Ngày vào làm:</b>{" "}
                                    {new Date(employee.hireDate).toLocaleDateString("vi-VN")}
                                </p>
                            )}
                        </div>
                    </section>

                    {/* Thống kê Xe */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 md:col-span-2">
                        <h2 className="text-xl font-bold text-emerald-300 mb-4">
                            Thống Kê Xe
                        </h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Số xe đang rảnh */}
                            <div className="rounded-lg bg-gradient-to-r from-emerald-900/30 to-teal-900/30 px-4 py-4 border border-emerald-500/20">
                                <p className="text-xs uppercase text-slate-400 mb-1">
                                    Xe Đang Rảnh
                                </p>
                                <p className="text-3xl font-bold text-emerald-400">
                                    {availableVehicles}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Tổng: {vehicles.length} xe
                                </p>
                            </div>

                            {/* Số xe đang bảo trì */}
                            <div className="rounded-lg bg-gradient-to-r from-yellow-900/30 to-orange-900/30 px-4 py-4 border border-yellow-500/20">
                                <p className="text-xs uppercase text-slate-400 mb-1">
                                    Xe Đang Bảo Trì
                                </p>
                                <p className="text-3xl font-bold text-yellow-400">
                                    {maintenanceVehicles}
                                </p>
                                <p className="text-xs text-slate-500 mt-1">
                                    Đang trong quá trình bảo trì
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

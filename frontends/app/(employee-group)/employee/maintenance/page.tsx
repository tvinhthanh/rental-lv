"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { vehicleService } from "@/services/vehicle.service";
import MaintenanceModal from "./_component/MaintenanceModal";

export default function MaintenancePage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    // Load employee info
    useEffect(() => {
        if (userLoading) return;

        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            return;
        }

        async function loadEmployee() {
            try {
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (err) {
                console.error("Load employee failed:", err);
            } finally {
                setLoadingEmployee(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    // Load vehicles & filter MAINTENANCE
    useEffect(() => {
        if (!employee?.branchId) return;

        async function loadVehicles() {
            try {
                setLoadingVehicles(true);

                const res = await vehicleService.getByBranch(employee.branchId);
                const list = res?.items || res?.data?.items || res || [];

                // const maintenanceVehicles = list.filter(
                //     (v: any) => v.status === "MAINTENANCE"
                // );

                setVehicles(list);
            } catch (err) {
                console.error("Load vehicles failed:", err);
            } finally {
                setLoadingVehicles(false);
            }
        }

        loadVehicles();
    }, [employee?.branchId]);

    // Guards
    if (userLoading || loadingEmployee) {
        return <p className="p-6 text-gray-200">Đang tải...</p>;
    }

    if (!user || user.role !== "EMPLOYEE") {
        return <p className="p-6 text-red-400">Bạn không có quyền truy cập.</p>;
    }

    if (!employee) {
        return <p className="p-6 text-red-400">Không tìm thấy thông tin nhân viên.</p>;
    }

    if (!employee.branchId) {
        return <p className="p-6 text-yellow-300">Bạn chưa được phân chi nhánh.</p>;
    }

    // Render
    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Xe đang bảo dưỡng tại chi nhánh:{" "}
                <span className="text-blue-400">{employee.branch?.name}</span>
            </h1>

            {loadingVehicles ? (
                <p className="text-gray-400">Đang tải danh sách xe...</p>
            ) : vehicles.length === 0 ? (
                <p className="text-gray-400">Hiện không có xe nào đang bảo dưỡng.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((v) => (
                        <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v)}
                            className="bg-slate-900 p-4 rounded-xl border border-slate-700 
                                       hover:border-orange-400/50 cursor-pointer transition shadow"
                        >
                            <img
                                src={v.photos?.[0] || "/no-image.png"}
                                className="w-full h-40 object-cover rounded-lg mb-3 border border-slate-700"
                            />

                            <h3 className="text-lg font-semibold text-gray-100">{v.name}</h3>

                            <p className="text-sm text-gray-300">Biển số: {v.licensePlate}</p>
                            <p className="text-sm text-gray-300">Loại: {v.category?.name}</p>

                            <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs 
                                             bg-orange-600/20 text-orange-400 border border-orange-700">
                                Đang bảo dưỡng
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {selectedVehicle && (
                <MaintenanceModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
}

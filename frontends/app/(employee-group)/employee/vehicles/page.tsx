"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { vehicleService } from "@/services/vehicle.service";
import VehicleModal from "./_components/VehicleModal";

export default function VehiclesPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loadingEmployee, setLoadingEmployee] = useState(true);
    const [loadingVehicles, setLoadingVehicles] = useState(true);

    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    // Load employee info
    useEffect(() => {
        if (userLoading) return;

        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            return;
        }

        async function fetchEmployee() {
            try {
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (err) {
                console.error("Failed to load employee:", err);
            } finally {
                setLoadingEmployee(false);
            }
        }

        fetchEmployee();
    }, [user, userLoading]);

    // Load vehicles by branch
    useEffect(() => {
        if (!employee?.branchId) return;

        async function fetchVehicles() {
            try {
                setLoadingVehicles(true);

                const res = await vehicleService.getByBranch(employee.branchId);
                const items = res?.items || res?.data?.items || res || [];

                setVehicles(items);
            } catch (err) {
                console.error("Failed to load vehicles:", err);
            } finally {
                setLoadingVehicles(false);
            }
        }

        fetchVehicles();
    }, [employee?.branchId]);

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

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">
                Danh sách xe tại chi nhánh:{" "}
                <span className="text-blue-400">{employee.branch?.name}</span>
            </h1>

            {loadingVehicles ? (
                <p className="text-gray-300">Đang tải danh sách xe...</p>
            ) : vehicles.length === 0 ? (
                <p className="text-gray-400">Không có xe nào.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {vehicles.map((v) => (
                        <div
                            key={v.id}
                            onClick={() => setSelectedVehicle(v)}
                            className="bg-slate-900 p-4 rounded-xl border border-slate-700 shadow hover:border-blue-400/40 transition cursor-pointer"
                        >
                            <img
                                src={v.photos?.[0] || "/no-image.png"}
                                className="w-full h-40 object-cover rounded-lg mb-3 border border-slate-700"
                                alt={v.name}
                            />

                            <h3 className="text-lg font-semibold text-gray-100">
                                {v.name}
                            </h3>

                            <p className="text-sm text-gray-300">Biển số: {v.licensePlate}</p>
                            <p className="text-sm text-gray-300">
                                Loại: {v.category?.name}
                            </p>

                            <div className="mt-2 text-blue-400 font-bold text-lg">
                                {v.priceList?.dailyRate?.toLocaleString("vi-VN")} đ/ngày
                            </div>

                            <div className="mt-2">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${v.status === "AVAILABLE"
                                            ? "bg-green-600/20 text-green-400 border border-green-700"
                                            : v.status === "RENTED"
                                                ? "bg-yellow-600/20 text-yellow-400 border border-yellow-700"
                                                : "bg-red-600/20 text-red-400 border border-red-700"}
                                    `}
                                >
                                    {v.status}
                                </span>
                            </div>
                        </div>
                    ))}

                </div>
            )}

            {selectedVehicle && (
                <VehicleModal
                    vehicle={selectedVehicle}
                    onClose={() => setSelectedVehicle(null)}
                />
            )}
        </div>
    );
}

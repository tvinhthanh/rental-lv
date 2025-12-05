"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";

function EmployeeProfile() {
    const { data: user, isLoading: userLoading } = useCurrentUser();

    const [employee, setEmployee] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") {
            setLoading(false);
            return;
        }

        async function loadEmployee() {
            try {
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (err) {
                console.error("Load employee failed:", err);
            } finally {
                setLoading(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    // Guards
    if (userLoading || loading) {
        return <p className="p-6 text-gray-200">Đang tải...</p>;
    }

    if (!user || user.role !== "EMPLOYEE") {
        return (
            <p className="p-6 text-red-400">Bạn không có quyền truy cập.</p>
        );
    }

    if (!employee) {
        return (
            <p className="p-6 text-red-400">Không tìm thấy dữ liệu nhân viên.</p>
        );
    }

    const userInfo = employee.user || {};

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-6">Thông tin nhân viên</h1>

            <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl">
                {/* Avatar + tên */}
                <div className="flex items-center gap-4 mb-6">
                    <img
                        src={userInfo.avatarUrl || "/avatar-default.png"}
                        className="w-20 h-20 rounded-full border border-slate-700"
                        alt="avatar"
                    />
                    <div>
                        <h2 className="text-xl font-semibold text-white">
                            {employee.fullName}
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Mã nhân viên: {employee.id}
                        </p>
                    </div>
                </div>

                {/* Thông tin chi tiết */}
                <div className="space-y-3 text-gray-300">
                    <p>
                        <b>Email:</b> {employee.email || userInfo.email}
                    </p>

                    <p>
                        <b>Số điện thoại:</b> {employee.phone}
                    </p>

                    <p>
                        <b>Tài khoản hệ thống:</b> {userInfo.email}
                    </p>

                    <p>
                        <b>Chi nhánh:</b>{" "}
                        {employee.branch?.name || "Chưa phân chi nhánh"}
                    </p>

                    <p>
                        <b>Ngày tạo:</b>{" "}
                        {employee.createdAt
                            ? new Date(employee.createdAt).toLocaleDateString("vi-VN")
                            : "—"}
                    </p>

                    <p>
                        <b>Cập nhật lần cuối:</b>{" "}
                        {employee.updatedAt
                            ? new Date(employee.updatedAt).toLocaleDateString("vi-VN")
                            : "—"}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default EmployeeProfile;

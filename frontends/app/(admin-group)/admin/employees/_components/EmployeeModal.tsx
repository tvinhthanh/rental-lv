'use client';

import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import { branchService } from "@/services/branch.service";
import { authService } from "@/services/auth.service";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "ON_LEAVE"];

// Normalize
const normalizeList = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.items)) return res.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.list)) return res.list;
    return [];
};

export default function EmployeeModal({ mode, data, onClose, onSuccess }: any) {
    const [branches, setBranches] = useState<any[]>([]);

    const [form, setForm] = useState({
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        email: data?.email || "",
        department: data?.department || "",
        position: data?.position || "",
        salary: data?.salary ?? "",
        status: data?.status || "ACTIVE",
        hireDate: data?.hireDate ? data.hireDate.slice(0, 10) : "",
        branchId: data?.branchId || "",
        avatarUrl: data?.avatarUrl || "",
    });

    //  LOAD BRANCHES (normalized)
    useEffect(() => {
        (async () => {
            try {
                const res = await branchService.getAll();
                const items = normalizeList(res);
                setBranches(items);
            } catch {
                setBranches([]);
            }
        })();
    }, []);

    //  UPDATE FORM WHEN EDIT
    useEffect(() => {
        setForm({
            fullName: data?.fullName || "",
            phone: data?.phone || "",
            email: data?.email || "",
            department: data?.department || "",
            position: data?.position || "",
            salary: data?.salary ?? "",
            status: data?.status || "ACTIVE",
            hireDate: data?.hireDate ? data.hireDate.slice(0, 10) : "",
            branchId: data?.branchId || "",
            avatarUrl: data?.avatarUrl || "",
        });
    }, [data]);

    //  HANDLE CHANGE
    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    //  SUBMIT
    const handleSubmit = async () => {
        const payload: any = {
            ...form,
            salary: form.salary === "" ? undefined : Number(form.salary),
            hireDate: form.hireDate || undefined,
            branchId: form.branchId || undefined,
        };

        if (mode === "create") {
            await authService.createEmployee(payload);
        } else {
            await employeeService.update(data.id, payload);
        }
        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="mb-6 pb-4 border-b border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white">
                            {mode === "create" ? "Thêm Nhân Viên" : "Chỉnh sửa Nhân Viên"}
                </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {mode === "create" ? "Thêm nhân viên mới vào hệ thống" : "Cập nhật thông tin nhân viên"}
                        </p>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Họ và tên *</label>
                    <input
                        name="fullName"
                                placeholder="Nhập họ và tên"
                        value={form.fullName}
                        onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                        required
                    />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                    <input
                        name="phone"
                                    placeholder="0123456789"
                        value={form.phone}
                        onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                    />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
                    <input
                        name="email"
                                    placeholder="email@example.com"
                        value={form.email}
                        onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                    />
                            </div>
                        </div>

                    <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Phòng ban</label>
                        <input
                            name="department"
                                    placeholder="Phòng ban"
                            value={form.department}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                        />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Chức vụ</label>
                        <input
                            name="position"
                                    placeholder="Chức vụ"
                            value={form.position}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                        />
                            </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Lương</label>
                        <input
                            name="salary"
                            type="number"
                                    placeholder="0"
                            value={form.salary}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                        />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Trạng thái</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s} className="bg-slate-800">{s}</option>
                            ))}
                        </select>
                            </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Chi nhánh</label>
                        <select
                            name="branchId"
                            value={form.branchId}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                                    <option value="" className="bg-slate-800">Chọn chi nhánh (tùy chọn)</option>
                            {branches.map((b: any) => (
                                        <option key={b.id} value={b.id} className="bg-slate-800">
                                    {b.name}
                                </option>
                            ))}
                        </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Ngày vào làm</label>
                        <input
                            name="hireDate"
                            type="date"
                            value={form.hireDate}
                            onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                            </div>
                    </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Avatar URL</label>
                    <input
                        name="avatarUrl"
                                placeholder="https://example.com/avatar.jpg"
                        value={form.avatarUrl}
                        onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-500"
                    />
                        </div>

                        <div className="border-t border-slate-700/50 pt-4 mt-6">
                            <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                                    className="px-5 py-2.5 border border-slate-600 text-gray-300 rounded-lg hover:bg-slate-800/50 transition-colors font-medium"
                        >
                                    Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
                        >
                                    {mode === "create" ? "Tạo" : "Lưu"}
                        </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

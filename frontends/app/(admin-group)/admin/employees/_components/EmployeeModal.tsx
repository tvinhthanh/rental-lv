'use client';

import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import { branchService } from "@/services/branch.service";
import { authService } from "@/services/auth.service";

const STATUS_OPTIONS = ["ACTIVE", "INACTIVE", "ON_LEAVE"];

// ==============================
// Normalize
// ==============================
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

    // ==============================
    // LOAD BRANCHES (normalized)
    // ==============================
    useEffect(() => {
        (async () => {
            const res = await branchService.getAll();
            const items = normalizeList(res);
            setBranches(items);
        })();
    }, []);

    // ==============================
    // UPDATE FORM WHEN EDIT
    // ==============================
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

    // ==============================
    // Handle change
    // ==============================
    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ==============================
    // SUBMIT
    // ==============================
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
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg shadow w-[420px] text-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                    {mode === "create" ? "Add Employee" : "Edit Employee"}
                </h2>

                <div className="flex flex-col space-y-3">
                    <input
                        name="fullName"
                        placeholder="Full Name *"
                        value={form.fullName}
                        onChange={handleChange}
                        className="input-dark"
                        required
                    />

                    <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-dark"
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="input-dark"
                    />

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="department"
                            placeholder="Department"
                            value={form.department}
                            onChange={handleChange}
                            className="input-dark"
                        />
                        <input
                            name="position"
                            placeholder="Position"
                            value={form.position}
                            onChange={handleChange}
                            className="input-dark"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="salary"
                            type="number"
                            placeholder="Salary"
                            value={form.salary}
                            onChange={handleChange}
                            className="input-dark"
                        />

                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="input-dark bg-slate-800"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <select
                            name="branchId"
                            value={form.branchId}
                            onChange={handleChange}
                            className="input-dark bg-slate-800"
                        >
                            <option value="">Assign branch (optional)</option>

                            {branches.map((b: any) => (
                                <option key={b.id} value={b.id}>
                                    {b.name}
                                </option>
                            ))}
                        </select>

                        <input
                            name="hireDate"
                            type="date"
                            value={form.hireDate}
                            onChange={handleChange}
                            className="input-dark"
                        />
                    </div>

                    <input
                        name="avatarUrl"
                        placeholder="Avatar URL"
                        value={form.avatarUrl}
                        onChange={handleChange}
                        className="input-dark"
                    />

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                        >
                            {mode === "create" ? "Create" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

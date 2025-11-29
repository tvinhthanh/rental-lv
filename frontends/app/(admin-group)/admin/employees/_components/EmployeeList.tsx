'use client';

import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import EmployeeModal from "./EmployeeModal";

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "text-green-400",
    INACTIVE: "text-red-400",
    ON_LEAVE: "text-yellow-300",
};

export default function EmployeeList() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<"create" | "edit">("create");
    const [selected, setSelected] = useState<any>(null);
    const [search, setSearch] = useState("");

    const loadData = async () => {
        setLoading(true);
        const res = await employeeService.list({ search });
        setEmployees(res.items ?? res);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [search]);

    const handleAdd = () => {
        setSelected(null);
        setMode("create");
        setOpen(true);
    };

    const handleEdit = (item: any) => {
        setSelected(item);
        setMode("edit");
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc muốn xóa?")) {
            await employeeService.delete(id);
            loadData();
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return "-";
        const d = new Date(value);
        return d.toLocaleDateString();
    };

    return (
        <div className="p-4 text-gray-200">
            <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold">Employees</h2>
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    + Add Employee
                </button>
            </div>

            <input
                type="text"
                placeholder="Search name / phone / email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-dark w-72 mb-4"
            />

            {loading ? (
                <p className="text-gray-400">Loading...</p>
            ) : (
                <div className="border border-slate-700 rounded-lg overflow-hidden">
                    <table className="w-full bg-slate-900">
                        <thead className="bg-slate-800 text-left text-gray-300">
                            <tr>
                                <th className="p-3">Full Name</th>
                                <th className="p-3">Phone</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Branch</th>
                                <th className="p-3">Department</th>
                                <th className="p-3">Position</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Hire Date</th>
                                <th className="p-3 w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees?.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="p-4 text-center text-gray-400">
                                        No employees found.
                                    </td>
                                </tr>
                            )}

                            {employees?.map(emp => (
                                <tr key={emp.id} className="border-b border-slate-700 hover:bg-slate-800">
                                    <td className="p-3">{emp.fullName}</td>
                                    <td className="p-3">{emp.phone || "-"}</td>
                                    <td className="p-3">{emp.email || "-"}</td>
                                    <td className="p-3">{emp.branch?.name || "-"}</td>
                                    <td className="p-3">{emp.department || "-"}</td>
                                    <td className="p-3">{emp.position || "-"}</td>
                                    <td className="p-3">
                                        <span className={STATUS_COLORS[emp.status || "ACTIVE"] || "text-gray-300"}>
                                            {emp.status || "ACTIVE"}
                                        </span>
                                    </td>
                                    <td className="p-3">{formatDate(emp.hireDate)}</td>
                                    <td className="p-3 text-center space-x-3">
                                        <button
                                            className="text-blue-400 hover:underline"
                                            onClick={() => handleEdit(emp)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-red-400 hover:underline"
                                            onClick={() => handleDelete(emp.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {open && (
                <EmployeeModal
                    mode={mode}
                    data={selected}
                    onClose={() => setOpen(false)}
                    onSuccess={() => {
                        setOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

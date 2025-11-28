'use client';

import { useEffect, useState } from "react";
import { employeeService } from "@/services/employee.service";
import EmployeeModal from "./EmployeeModal";

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

    return (
        <div className="bg-transparent shadow rounded p-4">
            <div className="flex justify-between mb-4">
                {/* <h2 className="text-xl font-semibold">Employee List</h2> */}
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
                >
                    + Add Employee
                </button>
            </div>

            <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border p-2 rounded"
            />

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border text-center text-white">
                    <thead>
                        <tr className="bg-transparent text-left">
                            <th className="p-2 border">Full Name</th>
                            <th className="p-2 border">Phone</th>
                            <th className="p-2 border">Email</th>
                            <th className="p-2 border">Department</th>
                            <th className="p-2 border">Position</th>
                            <th className="p-2 border w-32">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees?.map(emp => (
                            <tr key={emp.id} className="border">
                                <td className="p-2 border">{emp.fullName}</td>
                                <td className="p-2 border">{emp.phone}</td>
                                <td className="p-2 border">{emp.email}</td>
                                <td className="p-2 border">{emp.department}</td>
                                <td className="p-2 border">{emp.position}</td>
                                <td className="p-2 border text-center space-x-2">
                                    <button
                                        className="text-blue-600 hover:underline"
                                        onClick={() => handleEdit(emp)}
                                    >   
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-600 hover:underline"
                                        onClick={() => handleDelete(emp.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

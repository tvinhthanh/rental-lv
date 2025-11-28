'use client';

import { useState } from "react";
import { employeeService } from "@/services/employee.service";

export default function EmployeeModal({ mode, data, onClose, onSuccess }: any) {
    const [form, setForm] = useState({
        fullName: data?.fullName || "",
        phone: data?.phone || "",
        email: data?.email || "",
        department: data?.department || "",
        position: data?.position || "",
        salary: data?.salary || "",
    });

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async () => {
        if (mode === "create") {
            await employeeService.create(form);
        } else {
            await employeeService.update(data.id, form);
        }
        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-slate-900/50 p-6 rounded shadow w-96">
                <h2 className="text-xl font-semibold mb-4">
                    {mode === "create" ? "Add Employee" : "Edit Employee"}
                </h2>

                <div className="flex flex-col space-y-3">
                    <input
                        name="fullName"
                        placeholder="Full Name"
                        value={form.fullName}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        name="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        name="department"
                        placeholder="Department"
                        value={form.department}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />
                    <input
                        name="position"
                        placeholder="Position"
                        value={form.position}
                        onChange={handleChange}
                        className="border p-2 rounded"
                    />

                    <div className="flex justify-end space-x-3 mt-4">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300"
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

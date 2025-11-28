"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

type Props = {
    selected: any;
    onClose: () => void;
};

export default function UserModal({ selected, onClose }: Props) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        email: "",
        name: "",
        password: "",
        role: "CUSTOMER",
        isActive: true,
    });

    useEffect(() => {
        if (selected) {
            setForm({
                email: selected.email ?? "",
                name: selected.name ?? "",
                password: "",
                role: selected.role ?? "CUSTOMER",
                isActive: selected.isActive ?? true,
            });
        } else {
            setForm({
                email: "",
                name: "",
                password: "",
                role: "CUSTOMER",
                isActive: true,
            });
        }
    }, [selected]);

    const mutation = useMutation({
        mutationFn: async () => {
            const payload: any = {
                email: form.email,
                name: form.name,
                role: form.role,
                isActive: form.isActive,
            };

            if (selected) {
                if (form.password) payload.password = form.password;
                return userService.update(selected.id, payload);
            }

            if (!form.password) throw new Error("Password is required for new user");
            payload.password = form.password;
            return userService.create(payload);
        },
        onSuccess: () => {
            toast.success("Saved user");
            queryClient.invalidateQueries({ queryKey: ["users"] });
            onClose();
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Save failed";
            toast.error(msg);
        },
    });

    const onSubmit = () => {
        if (!form.email) {
            toast.error("Email is required");
            return;
        }
        mutation.mutate();
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 w-[420px] rounded-2xl shadow-xl text-gray-200">
                <h2 className="text-xl font-semibold mb-4">
                    {selected ? "Edit User" : "Add User"}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Email</label>
                        <input
                            className="input-dark w-full"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Name</label>
                        <input
                            className="input-dark w-full"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">
                            Password {selected ? "(leave blank to keep)" : ""}
                        </label>
                        <input
                            type="password"
                            className="input-dark w-full"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">Role</label>
                        <select
                            className="input-dark w-full"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="EMPLOYEE">EMPLOYEE</option>
                            <option value="CUSTOMER">CUSTOMER</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.isActive}
                            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        />
                        <span className="text-sm">Active</span>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-slate-600 text-gray-300 rounded hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onSubmit}
                        disabled={mutation.isPending}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-60"
                    >
                        {mutation.isPending ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}

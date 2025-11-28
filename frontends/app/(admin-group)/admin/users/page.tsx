"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import UserModal from "./_components/user-modal";

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["users", search],
        queryFn: () => userService.list(search),
    });

    const users = Array.isArray(data) ? data : data?.items ?? [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => userService.delete(id),
        onSuccess: () => {
            toast.success("Deleted user");
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Delete failed"),
    });

    return (
        <div className="p-4 text-gray-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Users</h1>
                    <p className="text-slate-400 text-sm">Quản lý tài khoản, vai trò và trạng thái.</p>
                </div>
                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    + Add User
                </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <input
                    placeholder="Search by email or name..."
                    className="input-dark border p-2 rounded w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-slate-900 border border-slate-700 rounded shadow">
                    <thead className="bg-slate-800 border-b border-slate-700 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Created</th>
                            <th className="p-3 text-left pl-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-400">Loading...</td></tr>
                        )}

                        {!isLoading && users.length === 0 && (
                            <tr><td colSpan={6} className="p-4 text-center text-slate-400">No users found</td></tr>
                        )}

                        {users.map((u: any) => (
                            <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800">
                                <td className="p-3">{u.email}</td>
                                <td className="p-3">{u.name ?? "-"}</td>
                                <td className="p-3 font-semibold">{u.role}</td>
                                <td className="p-3">
                                    {u.isActive ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-red-400">Inactive</span>
                                    )}
                                </td>
                                <td className="p-3 text-sm text-slate-400">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}
                                </td>
                                <td className="p-3 text-left pl-4">
                                    <button
                                        className="text-blue-400 mr-3"
                                        onClick={() => { setSelected(u); setOpen(true); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-400"
                                        onClick={() => {
                                            if (!confirm("Delete this user?")) return;
                                            deleteMutation.mutate(u.id);
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {open && (
                <UserModal
                    selected={selected}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}

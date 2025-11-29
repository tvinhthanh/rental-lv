"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { branchService } from "@/services/branch.service";
import { useState } from "react";
import BranchModal from "./_components/branch-modal";

export default function BranchPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["branches", search],
        queryFn: () => branchService.getAll(search),
    });

    const branches = Array.isArray(data) ? data : data?.items ?? [];

    async function handleDelete(id: string) {
        if (!confirm("Delete this branch?")) return;

        await branchService.delete(id);
        queryClient.invalidateQueries(["branches"]);
    }

    return (
        <div className="p-4 text-gray-200">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Branches</h1>
                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    + Add Branch
                </button>
            </div>

            <input
                placeholder="Search..."
                className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-60 mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full bg-slate-900">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Code</th>
                            <th className="p-3 text-left">Address</th>
                            <th className="p-3 text-left">City</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {isError && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-red-400">
                                    Failed to load.
                                </td>
                            </tr>
                        )}

                        {!isLoading && branches.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    No branches.
                                </td>
                            </tr>
                        )}

                        {branches.map((item: any) => (
                            <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800">
                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.code}</td>
                                <td className="p-3">{item.address}</td>
                                <td className="p-3">{item.city}</td>
                                <td className="p-3">{item.phone}</td>

                                <td className="p-3">
                                    {item.isActive ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-red-400">Inactive</span>
                                    )}
                                </td>

                                <td className="p-3 flex gap-4">
                                    <button
                                        className="text-blue-400"
                                        onClick={() => { setSelected(item); setOpen(true); }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="text-red-400"
                                        onClick={() => handleDelete(item.id)}
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
                <BranchModal
                    open={open}
                    selected={selected}
                    onClose={() => {
                        setOpen(false);
                        queryClient.invalidateQueries(["branches"]);
                    }}
                />
            )}
        </div>
    );
}

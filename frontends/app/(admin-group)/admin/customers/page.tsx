"use client";

import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import CustomerModal from "./_components/customer-modal";

export default function CustomersPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["customers", search],
        queryFn: () => customerService.list(search),
    });

    const customers = Array.isArray(data) ? data : data?.items ?? [];

    const deleteMutation = useMutation({
        mutationFn: (id: string) => customerService.delete(id),
        onSuccess: () => {
            toast.success("Deleted customer");
            queryClient.invalidateQueries({ queryKey: ["customers"] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Delete failed"),
    });

    return (
        <div className="p-4 text-gray-200">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Customers</h1>
                    <p className="text-slate-400 text-sm">Danh sách khách hàng và điểm thưởng.</p>
                </div>
                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    + Add Customer
                </button>
            </div>

            <div className="flex items-center gap-3 mb-4">
                <input
                    placeholder="Search by name or phone..."
                    className="input-dark border p-2 rounded w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-slate-900 border border-slate-700 rounded shadow">
                    <thead className="bg-slate-800 border-b border-slate-700 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Phone</th>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Tier</th>
                            <th className="p-3 text-left">Points</th>
                            <th className="p-3 text-left">Verified</th>
                            <th className="p-3 text-left pl-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr><td colSpan={7} className="p-4 text-center text-slate-400">Loading...</td></tr>
                        )}

                        {!isLoading && customers.length === 0 && (
                            <tr><td colSpan={7} className="p-4 text-center text-slate-400">No customers found</td></tr>
                        )}

                        {customers.map((c: any) => (
                            <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800">
                                <td className="p-3">{c.fullName}</td>
                                <td className="p-3">{c.phone}</td>
                                <td className="p-3">{c.email ?? "-"}</td>
                                <td className="p-3 font-semibold">{c.membershipTier ?? "BASIC"}</td>
                                <td className="p-3">{c.loyaltyPoints ?? 0}</td>
                                <td className="p-3">{c.isVerified ? <span className="text-green-400">Yes</span> : <span className="text-slate-400">No</span>}</td>
                                <td className="p-3 text-left pl-4">
                                    <button
                                        className="text-blue-400 mr-3"
                                        onClick={() => { setSelected(c); setOpen(true); }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="text-red-400"
                                        onClick={() => {
                                            if (!confirm("Delete this customer?")) return;
                                            deleteMutation.mutate(c.id);
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
                <CustomerModal
                    selected={selected}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}

"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { vehicleService } from "@/services/vehicle.service";
import VehicleModal from "./_components/vehicle-modal";

export default function VehiclePage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["vehicles", search],
        queryFn: () => vehicleService.getAll(search)
    });

    const vehicles = Array.isArray(data) ? data : data?.items ?? [];

    async function handleDelete(id: string) {
        if (!confirm("Delete this vehicle?")) return;
        await vehicleService.delete(id);
        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    }

    return (
        <div className="p-4 text-gray-200 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Vehicles</h1>
                    <p className="text-sm text-gray-400">Manage fleet with brand, branch, price source.</p>
                </div>
                <button
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    + Add Vehicle
                </button>
            </div>

            <div className="flex items-center gap-3">
                <input
                    placeholder="Search by name / plate..."
                    className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-72 focus:bg-white focus:text-black"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border border-slate-700 rounded-lg overflow-hidden shadow">
                <table className="w-full bg-slate-900">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Vehicle</th>
                            <th className="p-3 text-left">Plate</th>
                            <th className="p-3 text-left">Brand</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Branch</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Pricing</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-400">
                                    Loading...
                                </td>
                            </tr>
                        )}

                        {isError && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-red-400">
                                    Failed to load vehicles.
                                </td>
                            </tr>
                        )}

                        {!isLoading && vehicles.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-500">
                                    No vehicles.
                                </td>
                            </tr>
                        )}

                        {vehicles.map((item: any) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-700 hover:bg-slate-800"
                            >
                                <td className="p-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{item.name}</span>
                                        <span className="text-xs text-gray-400">{item.model ?? ""}</span>
                                    </div>
                                </td>
                                <td className="p-3">{item.licensePlate}</td>

                                <td className="p-3">
                                    {item.brand?.name ?? item.brandName ?? "-"}
                                </td>
                                <td className="p-3">
                                    {item.category?.name ?? item.categoryName ?? "-"}
                                </td>
                                <td className="p-3">
                                    {item.branch?.name ?? item.branchName ?? "-"}
                                </td>

                                <td className="p-3">
                                    <span className="uppercase text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">
                                        {item.status ?? "AVAILABLE"}
                                    </span>
                                </td>

                                <td className="p-3">
                                    {item.overridePriceEnabled ? (
                                        <div className="text-emerald-300 text-sm">
                                            Custom: {item.overrideDailyRate ?? "-"} /day
                                        </div>
                                    ) : (
                                        <div className="text-gray-400 text-sm">From price list</div>
                                    )}
                                </td>

                                <td className="p-3 flex gap-3">
                                    <button
                                        className="text-blue-400"
                                        onClick={() => {
                                            setSelected(item);
                                            setOpen(true);
                                        }}
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
                <VehicleModal
                    open={open}
                    selected={selected}
                    onClose={() => {
                        setOpen(false);
                        queryClient.invalidateQueries({ queryKey: ["vehicles"] });
                    }}
                />
            )}
        </div>
    );
}

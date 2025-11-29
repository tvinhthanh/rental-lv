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
        <div className="p-4 text-gray-200">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Vehicles</h1>
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

            <input
                placeholder="Search by name / plate..."
                className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-72 mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full bg-slate-900">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Plate</th>
                            <th className="p-3 text-left">Brand</th>
                            <th className="p-3 text-left">Category</th>
                            <th className="p-3 text-left">Branch</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Override</th>
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
                                <td className="p-3">{item.name}</td>
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
                                    <span className="uppercase text-sm">
                                        {item.status ?? "AVAILABLE"}
                                    </span>
                                </td>

                                <td className="p-3">
                                    {item.overridePriceEnabled ? (
                                        <span className="text-emerald-300">
                                            Custom: {item.overrideDailyRate ?? "-"} /day
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">From price list</span>
                                    )}
                                </td>

                                <td className="p-3 flex gap-4">
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

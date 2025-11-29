"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { vehicleCategoryService } from "@/services/vehicle-category.service";
import { useState } from "react";
import CategoryModal from "./_component/category-modal";

export default function VehicleCategoryPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ["vehicle-categories", search],
        queryFn: () => vehicleCategoryService.getAll(search),
    });

    const categories = Array.isArray(data) ? data : data?.items ?? [];

    async function handleDelete(id: string) {
        if (!confirm("Delete this category?")) return;
        await vehicleCategoryService.delete(id);
        queryClient.invalidateQueries(["vehicle-categories"]);
    }

    return (
        <div className="p-4 text-gray-200">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Vehicle Categories</h1>

                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                    + Add Category
                </button>
            </div>

            <input
                placeholder="Search..."
                className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-60 mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border border-slate-700 rounded-lg overflow-x-auto">
                <table className="w-full bg-slate-900 min-w-[900px]">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Code</th>
                            <th className="p-3 text-left">Slug</th>
                            <th className="p-3 text-left">Description</th>
                            <th className="p-3 text-left">Image</th>
                            <th className="p-3 text-left">Order</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-400">
                                    Loading categories...
                                </td>
                            </tr>
                        )}

                        {isError && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-red-400">
                                    Failed to load categories.
                                </td>
                            </tr>
                        )}

                        {!isLoading && categories.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-4 text-center text-gray-600">
                                    No categories found.
                                </td>
                            </tr>
                        )}

                        {categories.map((item: any) => (
                            <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800">

                                <td className="p-3">{item.name}</td>
                                <td className="p-3">{item.code}</td>
                                <td className="p-3">{item.slug}</td>
                                <td className="p-3">{item.description}</td>

                                <td className="p-3">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} className="w-16 h-12 object-cover rounded" />
                                    ) : (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </td>

                                <td className="p-3">{item.displayOrder ?? 0}</td>

                                <td className="p-3">
                                    {item.isActive ? (
                                        <span className="text-green-400">Active</span>
                                    ) : (
                                        <span className="text-red-400">Inactive</span>
                                    )}
                                </td>

                                <td className="p-3 flex gap-4 justify-center">
                                    <button
                                        className="text-blue-400 hover:underline"
                                        onClick={() => { setSelected(item); setOpen(true); }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="text-red-400 hover:underline"
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
                <CategoryModal
                    open={open}
                    selected={selected}
                    onClose={() => {
                        setOpen(false);
                        queryClient.invalidateQueries(["vehicle-categories"]);
                    }}
                />
            )}
        </div>
    );
}

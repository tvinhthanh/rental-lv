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
        queryFn: () => branchService.getAll(),
    });

    const branches = Array.isArray(data) ? data : data?.items ?? [];

    async function handleDelete(id: string) {
        if (!confirm("Bạn có chắc chắn muốn xóa chi nhánh này?")) return;

        await branchService.delete(id);
        queryClient.invalidateQueries({ queryKey: ["branches"] });
    }

    return (
        <div className="p-4 text-gray-200">

            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Chi Nhánh</h1>
                <button
                    onClick={() => { setSelected(null); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    + Thêm chi nhánh
                </button>
            </div>

            <input
                placeholder="Tìm kiếm..."
                className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-60 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border border-slate-700 rounded-lg overflow-hidden">
                <table className="w-full bg-slate-900">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Tên</th>
                            <th className="p-3 text-left">Mã</th>
                            <th className="p-3 text-left">Địa chỉ</th>
                            <th className="p-3 text-left">Thành phố</th>
                            <th className="p-3 text-left">Điện thoại</th>
                            <th className="p-3 text-left">Trạng thái</th>
                            <th className="p-3 text-left">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-400">
                                    Đang tải...
                                </td>
                            </tr>
                        )}

                        {isError && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-red-400">
                                    Lỗi tải dữ liệu.
                                </td>
                            </tr>
                        )}

                        {!isLoading && branches.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-4 text-center text-gray-500">
                                    Không có chi nhánh nào.
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
                                        <span className="text-green-400">Hoạt động</span>
                                    ) : (
                                        <span className="text-red-400">Không hoạt động</span>
                                    )}
                                </td>

                                <td className="p-3 flex gap-4">
                                    <button
                                        className="text-blue-400 hover:text-blue-300"
                                        onClick={() => { setSelected(item); setOpen(true); }}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="text-red-400 hover:text-red-300"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        Xóa
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
                        queryClient.invalidateQueries({ queryKey: ["branches"] });
                    }}
                />
            )}
        </div>
    );
}

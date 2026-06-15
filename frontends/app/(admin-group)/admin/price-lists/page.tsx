"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePriceLists } from "@/hooks/usePriceList";
import { priceListService } from "@/services/price-list.service";
import PriceListModal from "./_components/pricelist-modal";
import { useFormatVND } from "@/hooks/useFormatVND";

export default function PriceListPage() {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    const queryClient = useQueryClient();
    const { formatVND } = useFormatVND();

    // Fetch raw data (could be array or { items })
    const raw = usePriceLists();

    // Normalize to array
    const priceLists = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.items)
            ? raw.items
            : [];

    return (
        <div className="p-4 text-gray-200">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Bảng Giá</h1>

                <button
                    onClick={() => {
                        setSelected(null);
                        setOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                >
                    + Thêm bảng giá
                </button>
            </div>

            <input
                placeholder="Tìm kiếm..."
                className="bg-slate-800 border border-slate-700 text-gray-200 p-2 rounded w-60 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <div className="border border-slate-700 rounded-lg overflow-hidden shadow">
                <table className="w-full bg-slate-900">
                    <thead className="bg-slate-800 text-gray-300">
                        <tr>
                            <th className="p-3 text-left">Tên</th>
                            <th className="p-3 text-left">Theo ngày</th>
                            <th className="p-3 text-left">Theo giờ</th>
                            <th className="p-3 text-left">Cuối tuần</th>
                            <th className="p-3 text-left">Trạng thái</th>
                            <th className="p-3 text-left pl-4">Thao tác</th>
                        </tr>
                    </thead>

                    <tbody>
                        {priceLists.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="p-4 text-center text-gray-400"
                                >
                                    Không tìm thấy bảng giá nào.
                                </td>
                            </tr>
                        )}

                        {priceLists.map((p: any) => (
                            <tr
                                key={p.id}
                                className="border-b border-slate-700 hover:bg-slate-800"
                            >
                                <td className="p-3">{p.name}</td>
                                <td className="p-3">{formatVND(p.dailyRate)}</td>
                                <td className="p-3">
                                    {p.hourlyRate
                                        ? formatVND(p.hourlyRate)
                                        : "-"}
                                </td>
                                <td className="p-3">
                                    {p.weekendRate
                                        ? formatVND(p.weekendRate)
                                        : "-"}
                                </td>

                                <td className="p-3">
                                    {p.isActive ? (
                                        <span className="text-green-400">
                                            Hoạt động
                                        </span>
                                    ) : (
                                        <span className="text-red-400">
                                            Không hoạt động
                                        </span>
                                    )}
                                </td>

                                <td className="p-3 pl-4">
                                    <button
                                        className="text-blue-400 hover:text-blue-300 mr-3"
                                        onClick={() => {
                                            setSelected(p);
                                            setOpen(true);
                                        }}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="text-red-400 hover:text-red-300"
                                        onClick={async () => {
                                            if (
                                                !confirm(
                                                    "Bạn có chắc muốn xóa bảng giá này?"
                                                )
                                            )
                                                return;

                                            await priceListService.delete(p.id);
                                            queryClient.invalidateQueries({ queryKey: ["price-lists"] });
                                        }}
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
                <PriceListModal
                    open={open}
                    selected={selected}
                    onClose={() => setOpen(false)}
                />
            )}
        </div>
    );
}

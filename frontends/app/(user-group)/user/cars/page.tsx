/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { vehicleService } from "@/services/vehicle.service";
import { branchService } from "@/services/branch.service";
import { priceListService } from "@/services/price-list.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import Link from "next/link";

interface VehicleItem {
    id: string;
    name: string;
    brand?: string;
    model?: string;
    photos?: string[];
    licensePlate?: string;
    status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";

    branchId: string;
    priceListId?: string;

    category?: {
        name: string;
    };

    branch?: {
        name: string;
    };

    priceList?: {
        dailyRate?: number;
    };
}

interface Branch {
    id: string;
    name: string;
}

interface PriceList {
    id: string;
    name: string;
}

export default function CarsPage() {
    const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
    const [filtered, setFiltered] = useState<VehicleItem[]>([]);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [brands, setBrands] = useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [branchId, setBranchId] = useState("");
    const [brand, setBrand] = useState("");
    const [priceListId, setPriceListId] = useState("");
    const [status, setStatus] = useState("");

    const { formatVND } = useFormatVND();

    // LOAD DATA
    useEffect(() => {
        (async () => {
            const v = await vehicleService.getAll();

            const withPhotos: VehicleItem[] = v.filter(
                (x: VehicleItem) => Boolean(x.photos?.length)
            );

            setVehicles(withPhotos);
            setFiltered(withPhotos);

            setBrands([
                ...new Set(
                    withPhotos.map((c) => c.brand).filter((x): x is string => Boolean(x))
                ),
            ]);

            setBranches(await branchService.getAll());
            setPriceLists(await priceListService.getAll());
        })();
    }, []);

    // FILTER
    useEffect(() => {
        let list = [...vehicles];

        if (search.trim()) {
            const s = search.toLowerCase();
            list = list.filter(
                (x) =>
                    x.name.toLowerCase().includes(s) ||
                    x.licensePlate?.toLowerCase().includes(s) ||
                    x.model?.toLowerCase().includes(s)
            );
        }

        if (branchId) list = list.filter((x) => x.branchId === branchId);
        if (brand) list = list.filter((x) => x.brand === brand);
        if (priceListId) list = list.filter((x) => x.priceListId === priceListId);
        if (status) list = list.filter((x) => x.status === status);

        // Sort by status priority
        const priority: Record<string, number> = {
            AVAILABLE: 1,
            MAINTENANCE: 2,
            UNAVAILABLE: 3,
        };

        list = list.sort((a, b) => priority[a.status] - priority[b.status]);

        setFiltered(list);
    }, [search, branchId, brand, priceListId, status, vehicles]);

    const getStatusColor = (s: string) => {
        switch (s) {
            case "AVAILABLE":
                return "bg-green-600";
            case "MAINTENANCE":
                return "bg-yellow-500";
            case "UNAVAILABLE":
                return "bg-red-600";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-center">
                Danh sách xe cho thuê
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                {/* Search */}
                <input
                    placeholder="Tìm theo tên xe, biển số..."
                    className="input-dark border p-2 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Branch */}
                <select
                    className="input-dark border p-2 rounded"
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                >
                    <option value="">Tất cả chi nhánh</option>
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>

                {/* Brand */}
                <select
                    className="input-dark border p-2 rounded"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                >
                    <option value="">Tất cả hãng xe</option>
                    {brands.map((b, i) => (
                        <option key={i} value={b}>
                            {b}
                        </option>
                    ))}
                </select>

                {/* Price list */}
                <select
                    className="input-dark border p-2 rounded"
                    value={priceListId}
                    onChange={(e) => setPriceListId(e.target.value)}
                >
                    <option value="">Tất cả bảng giá</option>
                    {priceLists.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                {/* Status */}
                <select
                    className="input-dark border p-2 rounded"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="AVAILABLE">Sẵn sàng</option>
                    <option value="MAINTENANCE">Bảo dưỡng</option>
                    <option value="UNAVAILABLE">Không khả dụng</option>
                </select>
            </div>

            {/* RESULTS */}
            {filtered.length === 0 ? (
                <p className="text-center text-gray-400">
                    Không tìm thấy xe phù hợp.
                </p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map((car) => {
                        const price = car.priceList?.dailyRate
                            ? formatVND(car.priceList.dailyRate) + " / ngày"
                            : "—";

                        return (
                            <div
                                key={car.id}
                                className="relative bg-white dark:bg-zinc-900 rounded-xl shadow hover:shadow-lg transition border border-gray-200 dark:border-zinc-800"
                            >
                                <span
                                    className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold text-white rounded-full ${getStatusColor(
                                        car.status
                                    )}`}
                                >
                                    {car.status === "AVAILABLE" && "Sẵn sàng"}
                                    {car.status === "MAINTENANCE" && "Bảo dưỡng"}
                                    {car.status === "UNAVAILABLE" && "Hết xe"}
                                </span>

                                <img
                                    src={car.photos?.[0] || "/no-image.png"}
                                    alt={car.name}
                                    className="w-full h-56 object-cover rounded-t-xl"
                                />


                                <div className="p-4">
                                    <h3 className="text-xl font-bold mb-1">{car.name}</h3>

                                    <p className="text-blue-600 font-semibold mb-3">{price}</p>

                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Danh mục: {car.category?.name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Chi nhánh: {car.branch?.name}
                                    </p>

                                    <Link
                                        href={`/user/cars/${car.id}`}
                                        className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                                    >
                                        Xem ngay
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

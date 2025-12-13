/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { vehicleService } from "@/services/vehicle.service";
import { branchService } from "@/services/branch.service";
import { priceListService } from "@/services/price-list.service";
import { useFormatVND } from "@/hooks/useFormatVND";
import { toWebP, getImageLoading } from "@/lib/image-utils";
import Link from "next/link";

interface VehicleItem {
    id: string;
    name: string;
    brand?: { name: string };
    model?: string;
    photos?: string[];
    licensePlate?: string;
    status: "AVAILABLE" | "MAINTENANCE" | "UNAVAILABLE";

    branchId: string;
    priceListId?: string;
    slug?: string;
    category?: { name: string };
    branch?: { name: string };
    priceList?: { dailyRate?: number };
}

interface Branch {
    id: string;
    name: string;
}

interface PriceList {
    id: string;
    name: string;
}

function CarsPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
    const [filtered, setFiltered] = useState<VehicleItem[]>([]);

    const [branches, setBranches] = useState<Branch[]>([]);
    const [priceLists, setPriceLists] = useState<PriceList[]>([]);
    const [brands, setBrands] = useState<string[]>([]);

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [branchId, setBranchId] = useState(searchParams.get("branchId") || "");
    const [brand, setBrand] = useState("");
    const [priceListId, setPriceListId] = useState("");
    const [status, setStatus] = useState(searchParams.get("status") || "");

    const { formatVND } = useFormatVND();

    // LOAD DATA
    useEffect(() => {
        (async () => {
            const params: any = {};
            if (search) params.search = search;
            if (branchId) params.branchId = branchId;
            if (status) params.status = status;

            const v = await vehicleService.getAll(params);
            const b = await branchService.getAll();
            const p = await priceListService.getAll();

            const vehicleItems: VehicleItem[] = Array.isArray(v.items) ? v.items : Array.isArray(v) ? v : [];
            const branchItems: Branch[] = Array.isArray(b.items) ? b.items : Array.isArray(b) ? b : [];
            const priceListItems: PriceList[] = Array.isArray(p.items) ? p.items : Array.isArray(p) ? p : [];

            const withPhotos = vehicleItems.filter((x) => Boolean(x.photos?.length));

            setVehicles(withPhotos);
            setFiltered(withPhotos);

            const brandNames = [
                ...new Set(
                    withPhotos
                        .map((c) => c.brand?.name)
                        .filter((x): x is string => Boolean(x))
                ),
            ];

            setBrands(brandNames);
            setBranches(branchItems);
            setPriceLists(priceListItems);
        })();
    }, [search, branchId, status]);

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
        if (brand) list = list.filter((x) => x.brand?.name === brand);
        if (priceListId) list = list.filter((x) => x.priceListId === priceListId);
        if (status) list = list.filter((x) => x.status === status);

        const priority = {
            AVAILABLE: 1,
            MAINTENANCE: 2,
            UNAVAILABLE: 3,
        };

        list = list.sort((a, b) => priority[a.status] - priority[b.status]);

        setFiltered(list);
    }, [search, branchId, brand, priceListId, status, vehicles]);

    // update query string when filters change
    useEffect(() => {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (branchId) params.set("branchId", branchId);
        if (status) params.set("status", status);
        const qs = params.toString();
        const url = qs ? `/user/cars?${qs}` : "/user/cars";
        router.replace(url, { scroll: false });
    }, [search, branchId, status, router]);

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
            <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Danh sách xe cho thuê</h1>

            {/* FILTERS */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                <input
                    placeholder="Tìm theo tên xe, biển số..."
                    className="input-dark border p-2 rounded"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

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

            {/* RESULT LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((car) => {
                    const price = car.priceList?.dailyRate
                        ? `${formatVND(car.priceList.dailyRate)} / ngày`
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
                                src={toWebP(car.photos?.[0])}
                                alt={car.name}
                                className="w-full h-56 object-cover rounded-t-xl"
                                loading={getImageLoading(false)}
                                decoding="async"
                            />

                            <div className="p-4">
                                <h3 className="text-xl font-bold mb-1">{car.name}</h3>

                                <p className="text-blue-600 font-semibold mb-3">{price}</p>

                                <p className="text-sm text-gray-600 mb-2">
                                    Danh mục: {car.category?.name}
                                </p>

                                <p className="text-sm text-gray-600 mb-4">
                                    Chi nhánh: {car.branch?.name}
                                </p>

                                <p className="text-sm text-gray-600 mb-2">
                                    Hãng xe: {car.brand?.name}
                                </p>

                                <Link
                                    href={`/user/cars/${car.slug}`}
                                    className="block w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                                >
                                    Xem ngay
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function CarsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-400">Đang tải danh sách xe...</div>}>
            <CarsPageContent />
        </Suspense>
    );
}

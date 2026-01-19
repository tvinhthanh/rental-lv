"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { branchService } from "@/services/branch.service";
import { vehicleService } from "@/services/vehicle.service";
import { MapPin, Search } from "lucide-react";

export default function QuickBooking() {
    const router = useRouter();
    const [branches, setBranches] = useState<any[]>([]);
    const [keyword, setKeyword] = useState("");
    const [branchId, setBranchId] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                const res = await branchService.getAll();
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                setBranches(items);
            } catch (err) {
                console.error("Load branches failed", err);
                // Set empty array on error to prevent UI breakage
                setBranches([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.append("search", keyword.trim());
        if (branchId) params.append("branchId", branchId);
        params.append("status", "AVAILABLE");
        router.push(`/user/cars?${params.toString()}`);
    };

    return (
        <section className="max-w-6xl mx-auto -mt-24 px-4 relative z-[9999]">
            <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur shadow-xl p-4 flex flex-col gap-3 md:grid md:grid-cols-4">
                <div className="col-span-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Đặt xe nhanh</p>
                    <h3 className="text-lg font-bold">Chọn xe trong 60 giây</h3>
                    <p className="text-blue-100 text-xs mt-1">Lọc theo chi nhánh và từ khóa (tên xe/biển số).</p>
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-2 md:col-span-3">
                    <div className="flex items-center bg-white text-slate-900 rounded-lg px-3 py-1.5 shadow-inner">
                        <Search className="w-4 h-4 text-slate-500" />
                        <input
                            className="flex-1 px-2 py-1 outline-none text-sm"
                            placeholder="Tìm xe, biển số, mẫu xe..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-white text-slate-900 rounded-lg px-3 py-1.5 shadow-inner">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <select
                            className="flex-1 px-2 py-1 outline-none bg-transparent text-sm"
                            value={branchId}
                            onChange={(e) => setBranchId(e.target.value)}
                        >
                            <option value="">Tất cả chi nhánh</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#0b5ca7] hover:bg-[#0a4f8f] transition text-white font-semibold rounded-lg py-2 text-sm shadow-lg"
                        disabled={loading}
                    >
                        {loading ? "Đang tải..." : "Tìm xe ngay"}
                    </button>
                </form>
            </div>
        </section>
    );
}

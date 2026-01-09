"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { loyaltyTransactionService } from "@/services/loyalty-transaction.service";
import { Receipt } from "lucide-react";

export default function AdminLoyaltyTransactionsPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState<number>(0);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const res = await loyaltyTransactionService.list();
            const items = Array.isArray(res) ? res : (res?.items || []);
            setTransactions(items);
            setTotal(items.length);
        } catch (err) {
            // Silent fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }
        loadTransactions();
    }, [user, userLoading]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wide text-white">Loyalty Transactions</h1>
                        <p className="mt-1 text-sm text-slate-400">Giao dịch tích điểm</p>
                    </div>
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2 text-right">
                        <p className="text-xs uppercase text-slate-500">Tổng transactions</p>
                        <p className="text-lg font-semibold text-cyan-400">{total}</p>
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-12 text-center">
                        <Receipt className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                        <p className="text-slate-400">Chưa có transaction nào.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="p-3 text-left text-sm text-slate-400">Customer</th>
                                    <th className="p-3 text-left text-sm text-slate-400">Type</th>
                                    <th className="p-3 text-left text-sm text-slate-400">Points</th>
                                    <th className="p-3 text-left text-sm text-slate-400">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-900/50">
                                        <td className="p-3 text-white">{t.customer?.fullName || "N/A"}</td>
                                        <td className="p-3">
                                            <span className={`rounded-full px-2 py-1 text-xs ${
                                                t.type === 'earn' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                            }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="p-3 text-white">{t.points}</td>
                                        <td className="p-3 text-slate-400">
                                            {new Date(t.createdAt).toLocaleDateString("vi-VN")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}


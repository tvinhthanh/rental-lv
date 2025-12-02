 "use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { employeeService } from "@/services/employee.service";
import { rentalProcessService } from "@/services/rental-process.service";
import ContractModal from "./_components/ContractModal";

function ContractsContent() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const searchParams = useSearchParams();

    const [employee, setEmployee] = useState<any | null>(null);
    const [loadingEmployee, setLoadingEmployee] = useState(true);

    const [contracts, setContracts] = useState<any[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedContract, setSelectedContract] = useState<any | null>(null);

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "EMPLOYEE") {
            setLoadingEmployee(false);
            setLoading(false);
            return;
        }

        async function loadEmployee() {
            try {
                setLoadingEmployee(true);
                // Lấy employee theo userId (đúng endpoint /employees/user/:id)
                const res = await employeeService.getUser(user.id);
                setEmployee(res?.data || res);
            } catch (e) {
                console.error("Load employee failed", e);
                setError("Không thể tải dữ liệu nhân viên");
            } finally {
                setLoadingEmployee(false);
            }
        }

        loadEmployee();
    }, [user, userLoading]);

    async function loadContracts() {
        if (!employee?.branchId) return;
        try {
            setLoading(true);
            const res = await rentalProcessService.contractsByBranch(employee.branchId);

            const items = Array.isArray(res?.items) ? res.items : [];
            const totalCount = res?.total ?? items.length;

            setContracts(items);
            setTotal(totalCount);
            
            // Update selected contract if it exists
            if (selectedContract) {
                const updated = items.find((c: any) => c.id === selectedContract.id);
                if (updated) {
                    setSelectedContract(updated);
                }
            }
        } catch (e) {
            console.error("Load contracts failed", e);
            setError("Không thể tải danh sách hợp đồng");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadContracts();
    }, [employee?.branchId]);

    // Check query param để tự động mở modal khi redirect từ create page
    useEffect(() => {
        const contractId = searchParams.get("contractId");
        if (contractId && contracts.length > 0) {
            const contract = contracts.find((c) => c.id === contractId);
            if (contract) {
                setSelectedContract(contract);
                // Xóa query param sau khi đã mở modal
                window.history.replaceState({}, "", "/employee/contracts");
            }
        }
    }, [contracts, searchParams]);

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-2">
                Danh sách hợp đồng
            </h1>
            <p className="mb-4 text-sm text-slate-400">
                Chi nhánh:{" "}
                <span className="text-blue-400">
                    {employee?.branch?.name || employee?.branchId || "—"}
                </span>{" "}
                • Tổng: {total}
            </p>

            {loading ? (
                <p>Đang tải hợp đồng...</p>
            ) : error ? (
                <p className="text-red-400">{error}</p>
            ) : contracts.length === 0 ? (
                <p className="text-gray-400">Không có hợp đồng nào.</p>
            ) : (
                <>
                    <div className="space-y-3">
                        {contracts.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setSelectedContract(c)}
                                className="w-full text-left rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm flex justify-between items-center hover:border-blue-500/60 hover:bg-slate-900 transition-colors"
                            >
                                <div>
                                    <p className="font-semibold text-slate-100">
                                        {c.contractNo}
                                    </p>
                                    <p className="text-slate-300">
                                        Booking: {c.booking?.bookingCode} • Khách:{" "}
                                        {c.booking?.customer?.fullName}
                                    </p>
                                    <p className="text-slate-400 text-xs">
                                        Xe: {c.booking?.vehicle?.name} -{" "}
                                        {c.booking?.vehicle?.licensePlate}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">
                                        Trạng thái
                                    </p>
                                    <p className="font-semibold text-emerald-400">
                                        {c.status}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {selectedContract && (
                        <ContractModal
                            contract={selectedContract}
                            onClose={() => setSelectedContract(null)}
                            onRefresh={loadContracts}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default function ContractsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-gray-200">Đang tải...</div>}>
            <ContractsContent />
        </Suspense>
    );
}
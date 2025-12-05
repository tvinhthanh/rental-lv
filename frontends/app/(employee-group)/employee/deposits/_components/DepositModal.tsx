"use client";

type DepositModalProps = {
    deposit: any;
    onClose: () => void;
};

export default function DepositModal({ deposit, onClose }: DepositModalProps) {
    if (!deposit) return null;

    const booking = deposit.booking;
    const customer = booking?.customer || deposit.customer;
    const vehicle = booking?.vehicle;

    const remaining = deposit.totalAmount - deposit.usedAmount - deposit.refundedAmount;

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Tiền đặt cọc - Booking {booking?.bookingCode}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Ngày tạo: {deposit.createdAt ? new Date(deposit.createdAt).toLocaleDateString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "—"} • Trạng thái:{" "}
                            <span className="text-emerald-400 font-semibold">
                                {deposit.status}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-full bg-slate-800 px-3 py-1 text-lg text-slate-300 hover:bg-slate-700 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2 text-sm text-slate-200">
                    {/* Customer */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin khách hàng
                        </h3>
                        <p><b>Họ tên:</b> {customer?.fullName || "—"}</p>
                        <p><b>Điện thoại:</b> {customer?.phone || "—"}</p>
                        <p><b>Email:</b> {customer?.email || "—"}</p>
                    </section>

                    {/* Vehicle */}
                    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-1">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin xe
                        </h3>
                        <p><b>Tên xe:</b> {vehicle?.name}</p>
                        <p><b>Biển số:</b> {vehicle?.licensePlate}</p>
                        <p><b>Loại xe:</b> {vehicle?.vehicleType}</p>
                    </section>

                    {/* Deposit Info */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin tiền đặt cọc
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">Tổng tiền</p>
                                <p className="font-bold text-lg text-emerald-400">
                                    {deposit.totalAmount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Đã sử dụng</p>
                                <p className="font-semibold text-yellow-400">
                                    {deposit.usedAmount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Đã hoàn</p>
                                <p className="font-semibold text-blue-400">
                                    {deposit.refundedAmount?.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Còn lại</p>
                                <p className="font-semibold text-purple-400">
                                    {remaining.toLocaleString("vi-VN")} đ
                                </p>
                            </div>
                        </div>
                        {deposit.paymentMethod && (
                            <p className="text-xs text-slate-400">
                                <b>Phương thức thanh toán:</b> {deposit.paymentMethod}
                            </p>
                        )}
                        {deposit.notes && (
                            <p className="text-xs text-slate-400">
                                <b>Ghi chú:</b> {deposit.notes}
                            </p>
                        )}
                    </section>

                    {/* Deposit Details */}
                    {deposit.items && deposit.items.length > 0 && (
                        <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <h3 className="text-sm font-semibold text-blue-300 mb-2">
                                Chi tiết giao dịch
                            </h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {deposit.items.map((item: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="flex justify-between items-center text-xs bg-slate-950/60 p-2 rounded border border-slate-800"
                                    >
                                        <div>
                                            <p className="font-semibold">{item.itemType}</p>
                                            {item.itemName && <p className="text-slate-400">{item.itemName}</p>}
                                            {item.notes && <p className="text-slate-500">{item.notes}</p>}
                                        </div>
                                        <p className={`font-semibold ${item.amount < 0 ? "text-red-400" : "text-emerald-400"}`}>
                                            {item.amount < 0 ? "-" : "+"}
                                            {Math.abs(item.amount || 0).toLocaleString("vi-VN")} đ
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}


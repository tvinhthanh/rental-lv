"use client";

type HandoverModalProps = {
    handover: any;
    onClose: () => void;
};

export default function HandoverModal({ handover, onClose }: HandoverModalProps) {
    if (!handover) return null;

    const booking = handover.booking;
    const customer = booking?.customer;
    const vehicle = booking?.vehicle;

    return (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex">
            <div className="m-auto w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl bg-slate-950 border border-slate-800 p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">
                            Giao xe - Booking {booking?.bookingCode}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            Ngày tạo: {handover.createdAt ? new Date(handover.createdAt).toLocaleDateString("vi-VN", {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : "—"}
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
                        <p><b>Màu:</b> {vehicle?.color}</p>
                    </section>

                    {/* Handover Info */}
                    <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-2">
                        <h3 className="text-sm font-semibold text-blue-300 mb-1">
                            Thông tin giao xe
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-xs text-slate-400">Số km đầu</p>
                                <p className="font-semibold text-blue-400">
                                    {handover.odoStart || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Mức nhiên liệu</p>
                                <p className="font-semibold text-yellow-400">
                                    {handover.fuelLevelStart !== null ? `${handover.fuelLevelStart}%` : "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Nơi nhận</p>
                                <p className="font-semibold text-purple-400">
                                    {handover.pickupPlace || "—"}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Nhân viên</p>
                                <p className="font-semibold text-emerald-400">
                                    {handover.employee?.fullName || handover.handedOverBy || "—"}
                                </p>
                            </div>
                        </div>
                        {handover.exteriorStatus && (
                            <p className="text-xs text-slate-400">
                                <b>Tình trạng ngoại thất:</b> {handover.exteriorStatus}
                            </p>
                        )}
                        {handover.interiorStatus && (
                            <p className="text-xs text-slate-400">
                                <b>Tình trạng nội thất:</b> {handover.interiorStatus}
                            </p>
                        )}
                        {handover.accessories && (
                            <p className="text-xs text-slate-400">
                                <b>Phụ kiện:</b> {handover.accessories}
                            </p>
                        )}
                        {handover.damageNote && (
                            <p className="text-xs text-red-400">
                                <b>Ghi chú hư hỏng:</b> {handover.damageNote}
                            </p>
                        )}
                    </section>

                    {/* Photos */}
                    {handover.photoUrls && handover.photoUrls.length > 0 && (
                        <section className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                            <h3 className="text-sm font-semibold text-blue-300 mb-2">
                                Hình ảnh
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {handover.photoUrls.map((url: string, idx: number) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`Photo ${idx + 1}`}
                                        className="w-full h-24 object-cover rounded border border-slate-700"
                                    />
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


"use client";

export default function BookingModal({ booking, onClose, onCreateContract }: any) {
    if (!booking) return null;

    const customer = booking.customer;
    const vehicle = booking.vehicle;
    const branch = booking.branch;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex">
            {/* FULL PAGE */}
            <div className="bg-slate-900 w-full h-full overflow-y-auto p-6">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
                    <h2 className="text-2xl font-bold text-white">
                        Chi tiết Booking #{booking.bookingCode}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-8 text-gray-300">

                    {/* CUSTOMER */}
                    <section>
                        <h3 className="font-semibold text-lg text-blue-300">Thông tin khách hàng</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><b>Họ tên:</b> {customer?.fullName}</p>
                            <p><b>Số điện thoại:</b> {customer?.phone || "—"}</p>
                            <p><b>Email:</b> {customer?.email}</p>
                            <p><b>Địa chỉ:</b> {customer?.address || "—"}</p>
                        </div>
                    </section>

                    {/* VEHICLE */}
                    <section>
                        <h3 className="font-semibold text-lg text-blue-300">Thông tin xe</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><b>Tên xe:</b> {vehicle?.name}</p>
                            <p><b>Loại:</b> {vehicle?.vehicleType}</p>
                            <p><b>Biển số:</b> {vehicle?.licensePlate}</p>
                            <p><b>Màu:</b> {vehicle?.color}</p>
                            <p><b>Số ghế:</b> {vehicle?.seatCount}</p>
                            <p><b>Nhiên liệu:</b> {vehicle?.fuelType}</p>
                        </div>
                    </section>

                    {/* BRANCH */}
                    <section>
                        <h3 className="font-semibold text-lg text-blue-300">Chi nhánh</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><b>Tên:</b> {branch?.name}</p>
                            <p><b>Địa chỉ:</b> {branch?.address}</p>
                            <p><b>Điện thoại:</b> {branch?.phone}</p>
                            <p><b>Giờ làm việc:</b> {branch?.businessHours}</p>
                        </div>
                    </section>

                    {/* DATE */}
                    <section>
                        <h3 className="font-semibold text-lg text-blue-300">Thời gian thuê</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><b>Ngày nhận xe:</b> {new Date(booking.pickupDate).toLocaleDateString("vi-VN")}</p>
                            <p><b>Ngày trả xe:</b> {new Date(booking.returnDate).toLocaleDateString("vi-VN")}</p>
                        </div>
                    </section>

                    {/* PAYMENT */}
                    <section>
                        <h3 className="font-semibold text-lg text-blue-300">Thanh toán</h3>
                        <div className="mt-2 space-y-1 text-sm">
                            <p><b>Giá gốc:</b> {booking.baseAmount?.toLocaleString("vi-VN")} đ</p>
                            <p><b>Giảm giá:</b> {booking.discountAmount?.toLocaleString("vi-VN")} đ</p>
                            <p className="text-xl font-bold text-green-400">
                                Tổng: {booking.totalAmount?.toLocaleString("vi-VN")} đ
                            </p>
                        </div>
                    </section>
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-3 mt-10">
                    <button
                        onClick={() => onCreateContract?.(booking)}
                        className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                    >
                        Tạo hợp đồng
                    </button>

                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white"
                    >
                        Đóng
                    </button>
                </div>

            </div>
        </div>
    );
}

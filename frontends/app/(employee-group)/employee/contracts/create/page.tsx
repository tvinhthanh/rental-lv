"use client";

import { useSearchParams } from "next/navigation";

export default function CreateContractPage() {
    const params = useSearchParams();
    const bookingId = params.get("bookingId");

    return (
        <div className="p-6 text-gray-200">
            <h1 className="text-2xl font-bold mb-4">
                Tạo hợp đồng thuê xe
            </h1>

            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <p className="text-gray-300">
                    <b>Booking ID:</b> {bookingId}
                </p>

                <p className="text-gray-400 mt-2">
                    Ở đây bạn sẽ lấy thông tin booking và render form tạo hợp đồng.
                </p>
            </div>

            <div className="mt-6">
                <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
                >
                    Lưu hợp đồng
                </button>
            </div>
        </div>
    );
}

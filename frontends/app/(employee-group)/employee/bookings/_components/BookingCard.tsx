"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { getPlaceholderImage } from "@/lib/image-placeholder";

const STATUS_STYLES: Record<string, string> = {
    PENDING: "text-yellow-300 bg-yellow-300/10",
    CONFIRMED: "text-blue-400 bg-blue-400/10",
    ONGOING: "text-indigo-400 bg-indigo-400/10",
    COMPLETED: "text-green-400 bg-green-400/10",
    CANCELLED: "text-red-400 bg-red-400/10",
};

export default function BookingCard({ booking, onClick }: any) {
    const vehicle = booking.vehicle;
    const customer = booking.customer;

    const image =
        Array.isArray(vehicle?.photos) && vehicle.photos.length > 0
            ? vehicle.photos[0]
            : getPlaceholderImage();

    return (
        <div
            onClick={onClick}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                       hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 
                       transition-all duration-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold tracking-wide">
                    #{booking.bookingCode}
                </h2>

                <span
                    className={cn(
                        "px-3 py-1 text-sm rounded-full font-medium",
                        STATUS_STYLES[booking.status] || "text-gray-300 bg-gray-600/20"
                    )}
                >
                    {booking.status}
                </span>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-4 mb-4">
                <img
                    src={image}
                    alt={vehicle?.name}
                    className="w-20 h-20 object-cover rounded-lg border border-slate-700"
                />

                <div className="flex flex-col">
                    <p className="font-semibold text-gray-100 text-base">
                        {vehicle?.name}
                    </p>

                    <p className="text-gray-400 text-sm">
                        {vehicle?.category?.name || "—"} • {vehicle?.branch?.name || "—"}
                    </p>

                    <p className="text-gray-500 text-sm">
                        Biển số: {vehicle?.licensePlate}
                    </p>
                </div>
            </div>

            {/* Customer */}
            <div className="mb-4">
                <p className="text-gray-300 font-medium">
                    {customer?.fullName || "Khách hàng"}
                </p>

                <p className="text-gray-500 text-sm">
                    {customer?.phone || "Không có số"}
                </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                <div>
                    <p className="text-gray-500">Ngày bắt đầu</p>
                    <p className="font-medium text-gray-200">
                        {new Date(booking.pickupDate).toLocaleDateString("vi-VN")}
                    </p>
                </div>

                <div>
                    <p className="text-gray-500">Ngày trả</p>
                    <p className="font-medium text-gray-200">
                        {new Date(booking.returnDate).toLocaleDateString("vi-VN")}
                    </p>
                </div>
            </div>

            {/* Amount */}
            <div className="pt-3 border-t border-slate-800 text-right">
                <p className="font-bold text-blue-400 text-xl">
                    {booking.totalAmount?.toLocaleString("vi-VN")} đ
                </p>
            </div>
        </div>
    );
}

"use client";

import React from "react";
import { Phone, MapPin, CheckCircle2, Mail } from "lucide-react";

export default function CustomerCard({ customer, onClick }: any) {
    const getMembershipBadge = (tier: string) => {
        switch (tier?.toUpperCase()) {
            case "GOLD":
                return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            case "SILVER":
                return "text-slate-300 bg-slate-300/10 border-slate-300/20";
            case "PLATINUM":
                return "text-purple-400 bg-purple-400/10 border-purple-400/20";
            default:
                return "text-blue-400 bg-blue-400/10 border-blue-400/20";
        }
    };

    return (
        <div
            onClick={onClick}
            className="bg-slate-900 border border-slate-700 rounded-xl p-5 cursor-pointer 
                       hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/10 
                       transition-all duration-200 relative overflow-hidden group"
        >
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

            <div className="relative z-10">
                {/* Avatar ở giữa */}
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <img
                            src={customer.avatarUrl || "/avatar-default.png"}
                            alt={customer.fullName || "Customer"}
                            className="w-20 h-20 rounded-full border-2 border-slate-600 group-hover:border-purple-400/50 transition-colors duration-200 object-cover"
                        />
                        {customer.isVerified && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Tên */}
                <div className="text-center mb-3">
                    <h3 className="text-lg font-bold text-white truncate">
                        {customer.fullName || "—"}
                    </h3>
                </div>

                {/* Membership Badge */}
                <div className="flex justify-center mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getMembershipBadge(customer.membershipTier || "BASIC")}`}>
                        {customer.membershipTier || "BASIC"}
                    </div>
                </div>

                {/* Email và Phone gần nhau */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-gray-300 truncate">{customer.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-gray-300">{customer.phone || "—"}</span>
                    </div>
                    {customer.address && (
                        <div className="flex items-start gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-300 line-clamp-2">{customer.address || "—"}</span>
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="rounded-lg bg-gradient-to-br from-blue-900/30 to-indigo-900/30 px-3 py-2 border border-blue-500/20">
                        <p className="text-xs text-slate-400 mb-1">Số lần đặt</p>
                        <p className="text-xl font-bold text-blue-400">
                            {customer.bookingCount ?? 0}
                        </p>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-emerald-900/30 to-teal-900/30 px-3 py-2 border border-emerald-500/20">
                        <p className="text-xs text-slate-400 mb-1">Điểm tích lũy</p>
                        <p className="text-xl font-bold text-emerald-400">
                            {customer.loyaltyPoints ?? 0}
                        </p>
                    </div>
                </div>

                {/* Last Booking Date */}
                <div className="pt-3 border-t border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Lần đặt cuối</p>
                    <p className="text-sm font-medium text-gray-300">
                        {customer.lastBookingDate 
                            ? new Date(customer.lastBookingDate).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })
                            : "—"
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}

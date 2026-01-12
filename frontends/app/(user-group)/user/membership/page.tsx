"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Check, Crown, Star, Zap, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { customerService } from "@/services/customer.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MembershipPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [loading, setLoading] = useState(true);
    const [upgrading, setUpgrading] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!userLoading) {
            setLoading(false);
        }
    }, [userLoading]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    const membershipPlans = [
        {
            id: "basic",
            name: "Gói Cơ Bản",
            price: "Miễn phí",
            description: "Dành cho khách hàng mới",
            icon: Star,
            features: [
                "Đặt xe cơ bản",
                "Hỗ trợ qua email",
                "Thanh toán tiền mặt",
                "Không có ưu đãi đặc biệt",
            ],
            color: "from-blue-900/30 to-indigo-900/30",
            borderColor: "border-blue-500/30",
            textColor: "text-blue-400",
        },
        {
            id: "premium",
            name: "Gói Premium",
            price: "299.000 đ/tháng",
            description: "Dành cho khách hàng thường xuyên",
            icon: Zap,
            features: [
                "Giảm giá 10% cho mọi đặt xe",
                "Ưu tiên đặt xe",
                "Hỗ trợ 24/7",
                "Thanh toán linh hoạt",
                "Tích điểm thưởng",
            ],
            color: "from-purple-900/30 to-pink-900/30",
            borderColor: "border-purple-500/30",
            textColor: "text-purple-400",
            popular: true,
        },
        {
            id: "vip",
            name: "Gói VIP",
            price: "599.000 đ/tháng",
            description: "Dành cho khách hàng VIP",
            icon: Crown,
            features: [
                "Giảm giá 20% cho mọi đặt xe",
                "Ưu tiên cao nhất",
                "Hỗ trợ VIP 24/7",
                "Giao xe tận nơi miễn phí",
                "Tích điểm x2",
                "Quà tặng đặc biệt",
            ],
            color: "from-amber-900/30 to-orange-900/30",
            borderColor: "border-amber-500/30",
            textColor: "text-amber-400",
        },
    ];

    const handleUpgrade = async (planId: string) => {
        if (!user?.id) {
            toast.error("Vui lòng đăng nhập để nâng cấp");
            return;
        }

        if (planId === "basic") {
            toast.info("Bạn đang sử dụng gói này");
            return;
        }

        // Get customer by userId
        try {
            setUpgrading(planId);
            const customer = await customerService.getByUserId(user.id);
            
            if (!customer) {
                toast.error("Không tìm thấy thông tin khách hàng");
                return;
            }

            const membershipTier = planId.toUpperCase() === "PREMIUM" ? "PREMIUM" : "VIP";
            
            await customerService.upgradeMembership(customer.id, membershipTier);
            
            toast.success(`Nâng cấp thành công lên ${membershipTier}!`);
            router.refresh(); // Refresh để cập nhật user data
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Nâng cấp thất bại. Vui lòng thử lại.");
        } finally {
            setUpgrading(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-extrabold tracking-wide bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-md mb-2">
                        Gói Thành Viên
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Chọn gói phù hợp với nhu cầu của bạn
                    </p>
                </div>

                {/* Current Membership Status */}
                {user && (
                    <div className="mb-8 rounded-xl border-2 border-slate-700 bg-gradient-to-br from-slate-900/90 to-slate-800/90 p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Gói hiện tại của bạn</p>
                                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                        {user.membership || "Gói Cơ Bản"}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-400 mb-1">Trạng thái</p>
                                <span className="px-4 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30 flex items-center gap-1">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    Đang hoạt động
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Membership Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {membershipPlans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`relative flex flex-col rounded-2xl border-2 ${plan.borderColor} bg-gradient-to-br ${plan.color} p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                                    plan.popular ? "ring-2 ring-purple-500/50" : ""
                                }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-xs font-semibold text-white">
                                        Phổ Biến
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <div className={`inline-flex p-3 rounded-full bg-slate-800/50 mb-4 ${plan.textColor}`}>
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {plan.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        {plan.description}
                                    </p>
                                    <div className={`text-3xl font-extrabold ${plan.textColor} mb-2`}>
                                        {plan.price}
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-6 flex-grow">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <Check className={`w-5 h-5 ${plan.textColor} flex-shrink-0 mt-0.5`} />
                                            <span className="text-slate-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleUpgrade(plan.id)}
                                    disabled={upgrading === plan.id || (user?.membership?.toUpperCase() === plan.id.toUpperCase())}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                                        plan.popular
                                            ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl hover:scale-105"
                                            : `bg-slate-800 text-white hover:bg-slate-700 ${plan.borderColor} border hover:scale-105`
                                    }`}
                                >
                                    {upgrading === plan.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Đang xử lý...</span>
                                        </>
                                    ) : user?.membership?.toUpperCase() === plan.id.toUpperCase() ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Đang sử dụng</span>
                                        </>
                                    ) : plan.id === "basic" ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span>Đang sử dụng</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Nâng cấp ngay</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Benefits Section */}
                <div className="mt-12 rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-900/70 to-slate-800/70 p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-white mb-6 text-center bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                        Lợi ích khi nâng cấp
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { title: "Tiết kiệm chi phí", desc: "Giảm giá lên đến 20%", icon: "💰" },
                            { title: "Ưu tiên đặt xe", desc: "Đặt xe nhanh chóng", icon: "⚡" },
                            { title: "Hỗ trợ 24/7", desc: "Luôn có người hỗ trợ", icon: "🛟" },
                            { title: "Tích điểm thưởng", desc: "Đổi quà hấp dẫn", icon: "🎁" },
                        ].map((benefit, index) => (
                            <div 
                                key={index} 
                                className="text-center p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all duration-300 hover:scale-105"
                            >
                                <div className="text-3xl mb-2">{benefit.icon}</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="text-slate-400 text-sm">{benefit.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

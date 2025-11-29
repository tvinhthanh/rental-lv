import dynamic from "next/dynamic";
import { CalendarClock, Gauge, Headset, ShieldCheck } from "lucide-react";
import Hero from "@/components/layouts/hero";
import QuickBooking from "@/components/home/quick-booking";

const LazyCarSlider = dynamic(() => import("@/components/home/car-slider"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải xe nổi bật...</div>
    ),
});

const LazyPricing = dynamic(() => import("@/components/home/pricing-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải bảng giá...</div>
    ),
});

const LazyReview = dynamic(() => import("@/components/home/review-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải đánh giá...</div>
    ),
});

const LazyBranchMap = dynamic(() => import("@/components/home/branch-map"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải chi nhánh...</div>
    ),
});

const LazyBlogSection = dynamic(() => import("@/components/home/blog-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải bài viết...</div>
    ),
});

const LazyCarSlider = dynamic(() => import("@/components/home/car-slider"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải xe nổi bật...</div>
    ),
});

const LazyPricing = dynamic(() => import("@/components/home/pricing-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải bảng giá...</div>
    ),
});

const LazyReview = dynamic(() => import("@/components/home/review-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải đánh giá...</div>
    ),
});

const LazyBranchMap = dynamic(() => import("@/components/home/branch-map"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải chi nhánh...</div>
    ),
});

export default function HomeUserPage() {
    return (
        <div className="bg-[#0b1424] text-white">
            <Hero />

            <QuickBooking />

            {/* QUICK BOOKING */}
            <section className="max-w-6xl mx-auto -mt-24 px-4">
                <h2 className="text-2xl font-bold text-white mb-4">Đặt xe nhanh</h2>
                <div className="rounded-2xl bg-white/10 border border-white/10 backdrop-blur shadow-xl p-6 flex flex-col gap-4 md:grid md:grid-cols-4">
                    <div className="col-span-1">
                        <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Địa điểm & thời gian</p>
                        <h3 className="text-xl font-bold">Chọn xe trong 60 giây</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-3">
                        <input
                            className="bg-white text-slate-900 rounded-lg px-3 py-2 shadow-inner placeholder:text-slate-500"
                            placeholder="Địa điểm nhận xe"
                        />
                        <input
                            type="date"
                            className="bg-white text-slate-900 rounded-lg px-3 py-2 shadow-inner"
                        />
                        <input
                            type="date"
                            className="bg-white text-slate-900 rounded-lg px-3 py-2 shadow-inner"
                        />
                        <button className="md:col-span-3 w-full bg-[#0b5ca7] hover:bg-[#0a4f8f] transition text-white font-semibold rounded-lg py-3 shadow-lg">
                            Tìm xe ngay
                        </button>
                    </div>
                </div>
            </section>

            {/* VALUE PROPS */}
            <section className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                    <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                        Trải nghiệm chuẩn hãng, cảm hứng Ford
                    </h2>
                    <p className="text-slate-200 mt-3">
                        Xe đời mới, dịch vụ minh bạch, hỗ trợ 24/7. Lựa chọn linh hoạt cho nhu cầu cá nhân và doanh nghiệp.
                    </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                    <ShieldCheck className="w-10 h-10 text-blue-300" />
                    <div>
                        <p className="font-semibold text-lg">Bảo hiểm & bảo dưỡng</p>
                        <p className="text-slate-200 text-sm">Kiểm định định kỳ, bảo hiểm đầy đủ, lộ trình bảo dưỡng rõ ràng.</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                    <Gauge className="w-10 h-10 text-blue-300" />
                    <div>
                        <p className="font-semibold text-lg">Hiệu suất tối ưu</p>
                        <p className="text-slate-200 text-sm">Động cơ mạnh mẽ, tiết kiệm nhiên liệu, sẵn sàng cho mọi hành trình.</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                    <Headset className="w-10 h-10 text-blue-300" />
                    <div>
                        <p className="font-semibold text-lg">Hỗ trợ 24/7</p>
                        <p className="text-slate-200 text-sm">Đội ngũ chăm sóc đồng hành, xử lý sự cố và tư vấn lộ trình.</p>
                    </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-3">
                    <CalendarClock className="w-10 h-10 text-blue-300" />
                    <div>
                        <p className="font-semibold text-lg">Đặt lịch linh hoạt</p>
                        <p className="text-slate-200 text-sm">Chọn thời gian nhận/trả theo nhu cầu, tối ưu lịch trình cá nhân.</p>
                    </div>
                </div>
            </section>

            <LazyCarSlider />
            <LazyPricing />
            <LazyReview />
            <LazyBranchMap />
            <LazyBlogSection />
        </div>
    );
}

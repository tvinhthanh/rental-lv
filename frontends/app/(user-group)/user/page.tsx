import Hero from "@/components/layouts/hero";
import QuickBooking from "@/components/home/quick-booking";
import PricingSection from "@/components/home/pricing-section";
import ReviewSection from "@/components/home/review-section";
import dynamic from "next/dynamic";

const LazyCarSlider = dynamic(async () => await import("@/components/home/car-slider"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải xe nổi bật...</div>
    ),
});

const LazyPricing = dynamic(async () => await import("@/components/home/pricing-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải bảng giá...</div>
    ),
});

const LazyReview = dynamic(async () => await import("@/components/home/review-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải đánh giá...</div>      
    ),
});

const LazyBranchMap = dynamic(async () => await import("@/components/home/branch-map"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải chi nhánh...</div>
    ),
});

const LazyBlogSection = dynamic(async () => await import("@/components/home/blog-section"), {
    loading: () => (
        <div className="max-w-6xl mx-auto px-4 py-16 text-blue-100">Đang tải bài viết...</div>
    ),
});

export default function HomeUserPage() {
    return (
        <div className="bg-[#0b1424] text-white">
            <Hero />
            <QuickBooking/>
            <LazyCarSlider />
            <LazyPricing />
            {/* <PricingSection/> */}
            <LazyReview />
            <LazyBranchMap />
            <ReviewSection/>
            <LazyBlogSection />
        </div>
    );
}

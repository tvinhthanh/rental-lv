"use client";

type BlogPreview = {
    title: string;
    description: string;
    tag: string;
};

const placeholders: BlogPreview[] = [
    {
        tag: "Kinh nghiệm",
        title: "Mẹo lái xe đường dài an toàn và tiết kiệm",
        description: "Checklist trước khi chạy, cách giữ tốc độ ổn định và tối ưu nhiên liệu cho hành trình dài."
    },
    {
        tag: "Đánh giá xe",
        title: "Góc nhìn thực tế về các mẫu xe mới",
        description: "Cảm nhận vận hành, độ êm, mức tiêu hao và trang bị an toàn của các đời xe mới nhất."
    },
    {
        tag: "Bảo dưỡng",
        title: "Lịch bảo dưỡng đơn giản cho người bận rộn",
        description: "Hướng dẫn nhanh cách giữ xe khỏe, mốc thay dầu, lọc gió và kiểm tra lốp định kỳ."
    }
];

export default function BlogSection() {
    return (
        <section className="max-w-6xl mx-auto px-4 pb-14">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-200">Blog</p>
                        <h3 className="text-2xl md:text-3xl font-semibold">Chuyên mục blog sắp ra mắt</h3>
                        <p className="text-blue-100 max-w-3xl">
                            Nơi chia sẻ kinh nghiệm lái xe, review mẫu mới, mẹo bảo dưỡng và cập nhật khuyến mãi.
                        </p>
                    </div>
                    <span className="text-xs md:text-sm text-blue-100/80 border border-white/15 bg-white/5 px-3 py-1 rounded-lg">
                        xxx
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {placeholders.map((item, idx) => (
                        <article
                            key={`${item.tag}-${idx}`}
                            className="h-full rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
                        >
                            <span className="inline-flex items-center text-xs uppercase tracking-wide text-blue-200 bg-white/10 px-2 py-1 rounded-full w-fit">
                                {item.tag}
                            </span>
                            <h4 className="text-lg font-semibold">{item.title}</h4>
                            <p className="text-blue-100 text-sm flex-1">{item.description}</p>
                            <div className="text-blue-200 text-sm">Nội dung</div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

import { Star } from "lucide-react";

const reviews = [
    {
        name: "Nguyễn Văn A",
        content: "Xe mới, sạch, nhân viên hỗ trợ tận tình. Rất hài lòng!",
        stars: 5,
    },
    {
        name: "Trần Bích Ngọc",
        content: "Giá tốt, thủ tục nhanh chóng. Sẽ quay lại.",
        stars: 4,
    },
];

export default function ReviewSection() {
    return (
        <section className="py-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0b1424] to-[#0b1424]" />
            <div className="max-w-6xl mx-auto relative px-4">
                <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-2 text-white">
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                    Khách hàng nói gì?
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                    {reviews.map((r, idx) => (
                        <div
                            key={idx}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl text-white"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="text-yellow-400">
                                    {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                                </div>
                                <span className="text-sm text-blue-100">Đã thuê xe 3 ngày</span>
                            </div>
                            <p className="text-lg text-blue-50">&quot;{r.content}&quot;</p>
                            <p className="font-semibold mt-4">{r.name}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

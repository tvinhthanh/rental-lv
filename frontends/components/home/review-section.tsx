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
        <section className="py-20 bg-white dark:bg-black">
            <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-2">
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                Đánh giá khách hàng
            </h2>

            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                {reviews.map((r, idx) => (
                    <div
                        key={idx}
                        className="p-6 rounded-xl bg-gray-100 dark:bg-zinc-800 shadow"
                    >
                        <p className="text-lg">&quot;{r.content}&quot;</p>
                        <div className="text-yellow-400 mt-3">
                            {"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}
                        </div>
                        <p className="font-semibold mt-2">{r.name}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

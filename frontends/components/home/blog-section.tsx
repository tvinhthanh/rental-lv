"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/services/blog.service";
import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";

type BlogPreview = {
    id: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    createdAt?: string;
};

export default function BlogSection() {
    const [posts, setPosts] = useState<BlogPreview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        blogService
            .listPosts({ limit: 3, status: "PUBLISHED" })
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                setPosts(items as BlogPreview[]);
            })
            .catch((err) => {
                console.error("Load blog failed:", err);
                // Set empty array on error to prevent UI breakage
                setPosts([]);
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="max-w-6xl mx-auto px-4 pb-14">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-200">Blog</p>
                        <h3 className="text-2xl md:text-3xl font-semibold">Chia sẻ từ Rental System</h3>
                        <p className="text-blue-100 max-w-3xl">
                            Kinh nghiệm thuê xe an toàn, review dòng xe mới và cập nhật ưu đãi nổi bật.
                        </p>
                    </div>
                    <Link
                        href="/user/blog"
                        className="text-xs md:text-sm text-blue-100/80 border border-white/15 bg-white/5 px-3 py-1 rounded-lg inline-flex items-center gap-2 hover:border-white/30"
                    >
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-blue-100">Đang tải bài viết...</div>
                ) : posts.length === 0 ? (
                    <div className="text-blue-100">Chưa có bài blog nào.</div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((item) => (
                            <article
                                key={item.id}
                                className="h-full rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3"
                            >
                                <div className="flex items-center gap-2 text-xs text-blue-200">
                                    <CalendarDays className="w-4 h-4" />
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString("vi-VN") : "—"}
                                </div>
                                <h4 className="text-lg font-semibold line-clamp-2">{item.title}</h4>
                                <p className="text-blue-100 text-sm flex-1 line-clamp-3">
                                    {item.excerpt || item.content?.slice(0, 120) || ""}
                                </p>
                                <Link
                                    href={`/user/blog/${item.slug || item.id}`}
                                    className="text-blue-200 text-sm inline-flex items-center gap-1 hover:text-white"
                                >
                                    Đọc tiếp <ArrowRight className="w-4 h-4" />
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
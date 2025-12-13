"use client";

import { useEffect, useMemo, useState } from "react";
import { blogService } from "@/services/blog.service";
import Link from "next/link";
import { CalendarDays, Folder, Search, ArrowRight } from "lucide-react";

type BlogPost = {
    id: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    createdAt?: string;
    category?: any;
    categoryId?: string;
    thumbnailUrl?: string;
};

export default function BlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [searchInput, setSearchInput] = useState("");
    const [keyword, setKeyword] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        blogService
            .listCategories({ limit: 50 })
            .then((res) => {
                const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
                setCategories(items);
            })
            .catch((err) => {
                console.error("Load categories failed:", err);
            });
    }, []);

    useEffect(() => {
        loadPosts();
    }, [selectedCategory, keyword, page]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await blogService.listPosts({
                page,
                limit: 6,
                status: "PUBLISHED",
                ...(keyword ? { search: keyword } : {}),
                ...(selectedCategory ? { categoryId: selectedCategory } : {}),
            });
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setPosts(items as BlogPost[]);
            setTotalPages(res?.totalPages || 1);
        } catch (err: any) {
            setError(err?.message || "Không thể tải bài viết");
        } finally {
            setLoading(false);
        }
    };

    const latestHighlight = useMemo(() => posts[0], [posts]);

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-6xl mx-auto px-4 py-14 space-y-10">
                <header className="space-y-3">
                    <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Blog & chia sẻ</p>
                    <h1 className="text-4xl font-bold">Câu chuyện di chuyển & kinh nghiệm thuê xe</h1>
                    <p className="text-blue-100">Tổng hợp bài viết từ đội ngũ và khách hàng: review xe, mẹo lái an toàn, ưu đãi mới.</p>
                </header>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                        <Search className="w-5 h-5 text-blue-200" />
                        <input
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm bài viết, từ khóa, chủ đề..."
                            className="bg-transparent flex-1 text-white placeholder:text-blue-200 focus:outline-none"
                        />
                        <button
                            onClick={() => {
                                setKeyword(searchInput.trim());
                                setPage(1);
                            }}
                            className="px-4 py-2 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
                        >
                            Tìm kiếm
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            className={`px-3 py-2 rounded-full text-sm ${!selectedCategory ? "bg-white text-[#0b1f3a]" : "bg-white/10 border border-white/15"}`}
                            onClick={() => {
                                setSelectedCategory("");
                                setPage(1);
                            }}
                        >
                            Tất cả
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                className={`px-3 py-2 rounded-full text-sm ${selectedCategory === cat.id ? "bg-white text-[#0b1f3a]" : "bg-white/10 border border-white/15"}`}
                                onClick={() => {
                                    setSelectedCategory(cat.id);
                                    setPage(1);
                                }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="rounded-xl border border-rose-400/30 bg-rose-900/30 px-4 py-3 text-rose-100">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="text-blue-100">Đang tải bài viết...</div>
                ) : posts.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center text-blue-100">
                        Chưa có bài viết nào. Quay lại sau nhé!
                    </div>
                ) : (
                    <div className="space-y-8">
                        {latestHighlight && (
                            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0c1f36] via-[#0b1424] to-[#0b1f3a] p-6 shadow-2xl">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-blue-100">
                                            <Folder className="w-4 h-4" />
                                            {latestHighlight.category?.name || "Chuyên mục"}
                                            <span className="mx-2 text-white/20">•</span>
                                            <CalendarDays className="w-4 h-4" />
                                            {latestHighlight.createdAt ? new Date(latestHighlight.createdAt).toLocaleDateString("vi-VN") : "—"}
                                        </div>
                                        <h2 className="text-3xl font-bold">{latestHighlight.title}</h2>
                                        <p className="text-blue-100 text-lg line-clamp-3">
                                            {latestHighlight.excerpt || latestHighlight.content?.slice(0, 160) || ""}
                                        </p>
                                        <Link
                                            href={`/user/blog/${latestHighlight.slug || latestHighlight.id}`}
                                            className="inline-flex items-center gap-2 text-blue-200 hover:text-white font-semibold"
                                        >
                                            Đọc chi tiết <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                    {latestHighlight.thumbnailUrl && (
                                        <img
                                            src={latestHighlight.thumbnailUrl}
                                            alt={latestHighlight.title}
                                            className="w-full md:w-72 h-48 object-cover rounded-xl border border-white/10"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {posts.map((post, idx) => {
                                if (latestHighlight && post.id === latestHighlight.id && idx === 0) return null;
                                return (
                                    <article key={post.id} className="h-full rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3 shadow">
                                        <div className="flex items-center gap-2 text-xs text-blue-200">
                                            <Folder className="w-4 h-4" />
                                            {post.category?.name || "Chuyên mục"}
                                            <span className="mx-2 text-white/20">•</span>
                                            <CalendarDays className="w-4 h-4" />
                                            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "—"}
                                        </div>
                                        <h3 className="text-lg font-semibold line-clamp-2">{post.title}</h3>
                                        <p className="text-sm text-blue-100 line-clamp-3">{post.excerpt || post.content?.slice(0, 120) || ""}</p>
                                        <Link
                                            href={`/user/blog/${post.slug || post.id}`}
                                            className="text-blue-200 text-sm inline-flex items-center gap-1 hover:text-white font-semibold mt-auto"
                                        >
                                            Đọc tiếp <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 text-blue-100">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    className="px-3 py-2 rounded bg-white/10 disabled:opacity-50"
                                >
                                    Trang trước
                                </button>
                                <span>
                                    Trang {page} / {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    className="px-3 py-2 rounded bg-white/10 disabled:opacity-50"
                                >
                                    Trang sau
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

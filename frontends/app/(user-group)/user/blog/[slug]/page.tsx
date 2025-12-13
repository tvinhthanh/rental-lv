import { blogService } from "@/services/blog.service";
import { CalendarDays, Folder, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
    params: { slug: string };
};

const normalizeItems = (res: any) => (Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : []);

export default async function BlogDetailPage({ params }: Props) {
    const slug = params.slug;

    let postRes: any = null;
    try {
        postRes = await blogService.listPosts({ search: slug, limit: 1, status: "PUBLISHED" });
    } catch (err) {
        return notFound();
    }

    const post = normalizeItems(postRes)[0];
    if (!post) {
        return notFound();
    }

    let related: any[] = [];
    try {
        const relatedRes = await blogService.listPosts({
            limit: 4,
            status: "PUBLISHED",
            ...(post.categoryId ? { categoryId: post.categoryId } : {}),
        });
        related = normalizeItems(relatedRes).filter((p: any) => p.id !== post.id).slice(0, 3);
    } catch (err) {
        related = [];
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
                <Link href="/user/blog" className="inline-flex items-center gap-2 text-blue-200 hover:text-white">
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại blog
                </Link>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-blue-200">
                        <Folder className="w-4 h-4" />
                        {post.category?.name || "Chuyên mục"}
                        <span className="mx-2 text-white/20">•</span>
                        <CalendarDays className="w-4 h-4" />
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString("vi-VN") : "—"}
                    </div>
                    <h1 className="text-4xl font-bold leading-tight">{post.title}</h1>
                    {post.excerpt && <p className="text-lg text-blue-100">{post.excerpt}</p>}
                </div>

                {post.thumbnailUrl && (
                    <img
                        src={post.thumbnailUrl}
                        alt={post.title}
                        className="w-full h-80 object-cover rounded-2xl border border-white/10"
                    />
                )}

                <article className="space-y-4 leading-relaxed text-blue-100">
                    {post.content ? (
                        <div
                            className="[&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_strong]:text-white [&_p]:mb-3"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                    ) : (
                        <p className="whitespace-pre-wrap text-blue-100">{post.excerpt || ""}</p>
                    )}
                </article>

                {related.length > 0 && (
                    <div className="border-t border-white/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold">Bài viết liên quan</h3>
                            <Link href="/user/blog" className="text-sm text-blue-200 inline-flex items-center gap-1 hover:text-white">
                                Xem thêm <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {related.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/user/blog/${item.slug || item.id}`}
                                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-blue-400/50 transition"
                                >
                                    <div className="text-xs text-blue-200 flex items-center gap-2 mb-2">
                                        <Folder className="w-4 h-4" />
                                        {item.category?.name || "Chuyên mục"}
                                    </div>
                                    <p className="font-semibold text-white line-clamp-2">{item.title}</p>
                                    <p className="text-sm text-blue-100 line-clamp-3 mt-1">
                                        {item.excerpt || item.content?.slice(0, 120) || ""}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

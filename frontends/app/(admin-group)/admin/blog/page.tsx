"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { blogService } from "@/services/blog.service";
import { FileText, Folder, Plus, Search, Edit, Trash2, Calendar, Tag } from "lucide-react";
import BlogPostModal from "./_components/BlogPostModal";
import BlogCategoryModal from "./_components/BlogCategoryModal";
import { toast } from "sonner";
import SkeletonCard from "@/components/common/SkeletonCard";

export default function AdminBlogPage() {
    const { data: user, isLoading: userLoading } = useCurrentUser();
    const [activeTab, setActiveTab] = useState<"posts" | "categories">("posts");
    const [posts, setPosts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [openPostModal, setOpenPostModal] = useState(false);
    const [openCategoryModal, setOpenCategoryModal] = useState(false);

    const loadPosts = async () => {
        try {
            const res = await blogService.listPosts({ search, limit: 100 });
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setPosts(items);
        } catch (err: any) {
            console.error("Load posts failed:", err);
            toast.error("Không thể tải danh sách bài viết");
        }
    };

    const loadCategories = async () => {
        try {
            const res = await blogService.listCategories({ limit: 100 });
            const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
            setCategories(items);
        } catch (err: any) {
            console.error("Load categories failed:", err);
            toast.error("Không thể tải danh mục");
        }
    };

    useEffect(() => {
        if (userLoading) return;
        if (!user || user.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        const load = async () => {
            setLoading(true);
            await Promise.all([loadPosts(), loadCategories()]);
            setLoading(false);
        };
        load();
    }, [user, userLoading]);

    useEffect(() => {
        if (activeTab === "posts") {
            loadPosts();
        }
    }, [search, activeTab]);

    const handleDeletePost = async (post: any) => {
        if (!confirm("Xóa bài viết này?")) return;
        try {
            await blogService.deletePost(post.id);
            toast.success("Đã xóa bài viết");
            loadPosts();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa bài viết thất bại");
        }
    };

    const handleDeleteCategory = async (category: any) => {
        if (!confirm("Xóa danh mục này?")) return;
        try {
            await blogService.deleteCategory(category.id);
            toast.success("Đã xóa danh mục");
            loadCategories();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Xóa danh mục thất bại");
        }
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 flex items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            </div>
        );
    }

    if (!user || user.role !== "ADMIN") {
        return (
            <div className="min-h-screen bg-slate-950/90 text-gray-100 p-6">
                <p className="text-red-400">Bạn không có quyền truy cập.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/90 text-gray-100">
            <div className="mx-auto max-w-7xl px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-md mb-2">
                        Quản lý Blog
                    </h1>
                    <p className="text-slate-400">
                        Quản lý bài viết và danh mục blog
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-slate-700/50">
                    <button
                        onClick={() => setActiveTab("posts")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "posts"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-slate-400 hover:text-slate-300"
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Bài viết ({posts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("categories")}
                        className={`px-4 py-2 font-medium transition-colors ${
                            activeTab === "categories"
                                ? "text-blue-400 border-b-2 border-blue-400"
                                : "text-slate-400 hover:text-slate-300"
                        }`}
                    >
                        <Folder className="w-4 h-4 inline mr-2" />
                        Danh mục ({categories.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === "posts" ? (
                    <div>
                        {/* Search and Add */}
                        <div className="mb-4 flex gap-3">
                            <div className="flex-1 flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 bg-transparent text-white placeholder:text-slate-500 focus:outline-none"
                                />
                            </div>
                            <button
                                onClick={() => {
                                    setEditingPost(null);
                                    setOpenPostModal(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm bài viết
                            </button>
                        </div>

                        {/* Posts List */}
                        {loading ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                                <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400">Chưa có bài viết nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                        {post.title}
                                                    </h3>
                                                    {post.status === "PUBLISHED" && (
                                                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                                                            Đã xuất bản
                                                        </span>
                                                    )}
                                                </div>
                                                {post.excerpt && (
                                                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                                        {post.excerpt}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                                                    {post.category && (
                                                        <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                                                            <Tag className="w-3 h-3" />
                                                            {post.category.name}
                                                        </span>
                                                    )}
                                                    {post.createdAt && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingPost(post);
                                                        setOpenPostModal(true);
                                                    }}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-110"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePost(post)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        {/* Add Category */}
                        <div className="mb-4">
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setOpenCategoryModal(true);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                            >
                                <Plus className="w-4 h-4" />
                                Thêm danh mục
                            </button>
                        </div>

                        {/* Categories List */}
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <SkeletonCard key={i} />
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 py-12 text-center">
                                <Folder className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400">Chưa có danh mục nào.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="group bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-5 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Folder className="w-5 h-5 text-blue-400" />
                                                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                        {category.name}
                                                    </h3>
                                                </div>
                                                {category.description && (
                                                    <p className="text-slate-400 text-sm line-clamp-2">
                                                        {category.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(category);
                                                        setOpenCategoryModal(true);
                                                    }}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all hover:scale-110"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCategory(category)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all hover:scale-110"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {openPostModal && (
                <BlogPostModal
                    open={openPostModal}
                    selected={editingPost}
                    categories={categories}
                    onClose={() => {
                        setOpenPostModal(false);
                        setEditingPost(null);
                    }}
                    onSaved={() => {
                        loadPosts();
                        setOpenPostModal(false);
                        setEditingPost(null);
                    }}
                />
            )}

            {openCategoryModal && (
                <BlogCategoryModal
                    open={openCategoryModal}
                    selected={editingCategory}
                    onClose={() => {
                        setOpenCategoryModal(false);
                        setEditingCategory(null);
                    }}
                    onSaved={() => {
                        loadCategories();
                        setOpenCategoryModal(false);
                        setEditingCategory(null);
                    }}
                />
            )}
        </div>
    );
}

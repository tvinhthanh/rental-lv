import { Folder, Image as ImageIcon } from "lucide-react";

export default function CategoryCard({ category, onEdit, onDelete }: any) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-purple-500/70 hover:shadow-[0_0_35px_rgba(168,85,247,0.45)]">
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-purple-500/0 opacity-0 blur-sm transition group-hover:border-purple-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-purple-600/20 via-slate-900/60 to-pink-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-purple-300 ring-1 ring-purple-400/30">
                        <Folder className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Mã danh mục
                        </span>
                        <span className="text-sm font-semibold text-purple-300">
                            {category.code || "—"}
                        </span>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${
                    category.isActive 
                        ? "bg-green-500/20 text-green-400 ring-green-500/50" 
                        : "bg-red-500/20 text-red-400 ring-red-500/50"
                }`}>
                    {category.isActive ? "Hoạt động" : "Không hoạt động"}
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Category Name */}
                <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">
                        Tên danh mục
                    </p>
                    <p className="text-sm font-medium text-slate-100">
                        {category.name || "—"}
                    </p>
                    {category.slug && (
                        <p className="text-[11px] text-slate-400">
                            /{category.slug}
                        </p>
                    )}
                </div>

                {/* Description */}
                {category.description && (
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Mô tả
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                            {category.description}
                        </p>
                    </div>
                )}

                {/* Image & Order */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            Hình ảnh
                        </p>
                        {category.imageUrl ? (
                            <img 
                                src={category.imageUrl} 
                                alt={category.name}
                                className="w-full h-16 object-cover rounded-lg border border-slate-700 mt-1"
                            />
                        ) : (
                            <p className="text-[11px] text-slate-500 mt-1">Chưa có ảnh</p>
                        )}
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Thứ tự
                        </p>
                        <p className="text-sm font-semibold text-purple-300">
                            {category.displayOrder ?? 0}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(category);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(category.id);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-600/30 transition-colors"
                    >
                        Xóa
                    </button>
                </div>
            </div>
        </div>
    );
}


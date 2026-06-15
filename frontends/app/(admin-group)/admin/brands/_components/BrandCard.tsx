import { Building2, Globe, Star } from "lucide-react";

export default function BrandCard({ brand, onEdit, onDelete }: any) {
    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-orange-500/70 hover:shadow-[0_0_35px_rgba(249,115,22,0.45)]">
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-orange-500/0 opacity-0 blur-sm transition group-hover:border-orange-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-orange-600/20 via-slate-900/60 to-amber-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-orange-300 ring-1 ring-orange-400/30">
                        <Building2 className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Thương hiệu
                        </span>
                        <span className="text-sm font-semibold text-orange-300">
                            {brand.name || "—"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                    {brand.isFeatured && (
                        <div className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 bg-yellow-500/20 text-yellow-400 ring-yellow-500/50">
                            <Star className="w-3 h-3 inline mr-1" />
                            Nổi bật
                        </div>
                    )}
                    <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${
                        (brand.isActive !== false && brand.status !== false)
                            ? "bg-green-500/20 text-green-400 ring-green-500/50" 
                             : "bg-red-500/20 text-red-400 ring-red-500/50"
                    }`}>
                        {(brand.isActive !== false && brand.status !== false) ? "Hoạt động" : "Không hoạt động"}
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Slug */}
                {brand.slug && (
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Slug
                        </p>
                        <p className="text-sm text-slate-400">
                            /{brand.slug}
                        </p>
                    </div>
                )}

                {/* Country & Website */}
                <div className="grid grid-cols-1 gap-3 text-xs">
                    {brand.country && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500">
                                Quốc gia
                            </p>
                            <p className="text-sm font-medium text-slate-100">
                                {brand.country}
                            </p>
                        </div>
                    )}

                    {brand.websiteUrl && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                Website
                            </p>
                            <a
                                href={brand.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline truncate block"
                            >
                                {brand.websiteUrl}
                            </a>
                        </div>
                    )}
                </div>

                {/* Logo */}
                {brand.logoUrl && (
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Logo
                        </p>
                        <div className="flex justify-center mt-2">
                            <img 
                                src={brand.logoUrl} 
                                alt={brand.name}
                                className="h-16 object-contain"
                            />
                        </div>
                    </div>
                )}

                {/* Description */}
                {brand.description && (
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Mô tả
                        </p>
                        <p className="text-[11px] text-slate-300 line-clamp-2">
                            {brand.description}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(brand);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(brand.id);
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


interface SkeletonListProps {
    items?: number;
}

export default function SkeletonList({ items = 5 }: SkeletonListProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div
                    key={i}
                    className="bg-slate-900 border border-slate-700 rounded-lg p-4 animate-pulse"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-slate-700 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            <div className="h-3 bg-slate-700 rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

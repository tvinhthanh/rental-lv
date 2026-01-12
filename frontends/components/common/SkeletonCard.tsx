export default function SkeletonCard() {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
            </div>
        </div>
    );
}

interface SkeletonTableProps {
    rows?: number;
    cols?: number;
}

export default function SkeletonTable({ rows = 5, cols = 4 }: SkeletonTableProps) {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-700">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-4 py-3 text-left">
                                    <div className="h-4 bg-slate-700 rounded w-20 animate-pulse"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="border-b border-slate-700/50">
                                {Array.from({ length: cols }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-4 py-3">
                                        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

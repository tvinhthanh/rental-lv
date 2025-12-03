import { User, Phone, Mail, Building, Briefcase, Calendar } from "lucide-react";

export default function EmployeeCard({ employee, onEdit, onDelete }: any) {
    const statusColors: Record<string, string> = {
        ACTIVE: "bg-green-500/20 text-green-400 ring-green-500/50",
        INACTIVE: "bg-red-500/20 text-red-400 ring-red-500/50",
        ON_LEAVE: "bg-yellow-500/20 text-yellow-400 ring-yellow-500/50",
    };

    const statusLabels: Record<string, string> = {
        ACTIVE: "Đang làm việc",
        INACTIVE: "Ngừng làm việc",
        ON_LEAVE: "Nghỉ phép",
    };

    const statusColor = statusColors[employee.status] || statusColors.ACTIVE;
    const statusText = statusLabels[employee.status] || employee.status || "ACTIVE";

    const formatDate = (value?: string) => {
        if (!value) return "—";
        const d = new Date(value);
        return d.toLocaleDateString("vi-VN");
    };

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-slate-700/80 
                       bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950
                       shadow-[0_0_25px_rgba(0,0,0,0.8)] transition cursor-pointer
                       hover:-translate-y-1 hover:border-emerald-500/70 hover:shadow-[0_0_35px_rgba(16,185,129,0.45)]">
            {/* Glow frame */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-emerald-500/0 opacity-0 blur-sm transition group-hover:border-emerald-400/40 group-hover:opacity-100" />

            {/* Header strip */}
            <div className="relative flex items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-emerald-600/20 via-slate-900/60 to-teal-600/20 px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-slate-900/70 text-emerald-300 ring-1 ring-emerald-400/30">
                        <User className="w-4 h-4" />
                    </span>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                            Nhân viên
                        </span>
                        <span className="text-sm font-semibold text-emerald-300">
                            {employee.fullName || "—"}
                        </span>
                    </div>
                </div>

                <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ${statusColor}`}>
                    {statusText}
                </div>
            </div>

            {/* Body */}
            <div className="relative space-y-4 px-4 pb-4 pt-3">
                {/* Contact Info */}
                <div className="grid grid-cols-1 gap-3 text-xs">
                    {employee.phone && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                Số điện thoại
                            </p>
                            <p className="text-sm font-medium text-slate-100">
                                {employee.phone}
                            </p>
                        </div>
                    )}

                    {employee.email && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                Email
                            </p>
                            <p className="text-sm font-medium text-slate-100 truncate">
                                {employee.email}
                            </p>
                        </div>
                    )}
                </div>

                {/* Branch & Department */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            Chi nhánh
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {employee.branch?.name || "—"}
                        </p>
                    </div>

                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            Phòng ban
                        </p>
                        <p className="truncate text-sm font-medium text-slate-100">
                            {employee.department || "—"}
                        </p>
                    </div>
                </div>

                {/* Position & Hire Date */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Chức vụ
                        </p>
                        <p className="text-sm font-medium text-slate-100">
                            {employee.position || "—"}
                        </p>
                    </div>

                    {employee.hireDate && (
                        <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Ngày vào làm
                            </p>
                            <p className="text-[11px] text-slate-300">
                                {formatDate(employee.hireDate)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Salary */}
                {employee.salary && (
                    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-900/70 p-2.5">
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">
                            Lương
                        </p>
                        <p className="text-sm font-semibold text-emerald-400">
                            {employee.salary.toLocaleString("vi-VN")} đ
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-800/80 pt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(employee);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-600/30 transition-colors"
                    >
                        Sửa
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(employee.id);
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


"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonsProps {
    exportExcelUrl?: string;
    exportPdfUrl?: string;
    filename?: string;
    onExportExcel?: () => Promise<void>;
    onExportPdf?: () => Promise<void>;
    className?: string;
}

export default function ExportButtons({
    exportExcelUrl,
    exportPdfUrl,
    filename = "report",
    onExportExcel,
    onExportPdf,
    className = ""
}: ExportButtonsProps) {
    const [exportingExcel, setExportingExcel] = useState(false);
    const [exportingPdf, setExportingPdf] = useState(false);

    const handleExportExcel = async () => {
        if (onExportExcel) {
            setExportingExcel(true);
            try {
                await onExportExcel();
                toast.success("Xuất Excel thành công!");
            } catch (error: any) {
                toast.error(error?.message || "Xuất Excel thất bại");
            } finally {
                setExportingExcel(false);
            }
            return;
        }

        if (!exportExcelUrl) {
            toast.error("Chưa cấu hình URL export Excel");
            return;
        }

        setExportingExcel(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(exportExcelUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Xuất Excel thành công!");
        } catch (error: any) {
            toast.error(error?.message || "Xuất Excel thất bại");
        } finally {
            setExportingExcel(false);
        }
    };

    const handleExportPdf = async () => {
        if (onExportPdf) {
            setExportingPdf(true);
            try {
                await onExportPdf();
                toast.success("Xuất PDF thành công!");
            } catch (error: any) {
                toast.error(error?.message || "Xuất PDF thất bại");
            } finally {
                setExportingPdf(false);
            }
            return;
        }

        if (!exportPdfUrl) {
            toast.error("Chưa cấu hình URL export PDF");
            return;
        }

        setExportingPdf(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(exportPdfUrl, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${filename}-${new Date().toISOString().split("T")[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("Xuất PDF thành công!");
        } catch (error: any) {
            toast.error(error?.message || "Xuất PDF thất bại");
        } finally {
            setExportingPdf(false);
        }
    };

    return (
        <div className={`flex gap-2 ${className}`}>
            {(exportExcelUrl || onExportExcel) && (
                <button
                    onClick={handleExportExcel}
                    disabled={exportingExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    {exportingExcel ? "Đang xuất..." : "Xuất Excel"}
                </button>
            )}
            {(exportPdfUrl || onExportPdf) && (
                <button
                    onClick={handleExportPdf}
                    disabled={exportingPdf}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileText className="w-4 h-4" />
                    {exportingPdf ? "Đang xuất..." : "Xuất PDF"}
                </button>
            )}
        </div>
    );
}

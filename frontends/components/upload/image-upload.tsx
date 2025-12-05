"use client";

import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
    placeholder?: string;
    accept?: string;
}

export default function ImageUpload({
    value,
    onChange,
    label,
    placeholder = "Chọn ảnh hoặc nhập URL",
    accept = "image/*",
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlValue, setUrlValue] = useState("");

    const handleFileUpload = async (file: File) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Vui lòng chọn file ảnh");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Kích thước file không được vượt quá 5MB");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();
            formData.append("files", file);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
            const response = await fetch(`${apiUrl}/upload/images`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Upload thất bại");
            }

            const data = await response.json();
            const uploadedUrl = data.urls?.[0];

            if (uploadedUrl) {
                onChange(uploadedUrl);
                toast.success("Upload ảnh thành công!");
            } else {
                throw new Error("Không nhận được URL từ server");
            }
        } catch (err: any) {
            console.error("Upload error:", err);
            toast.error(err?.message || "Upload thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleUrlSubmit = () => {
        if (urlValue.trim()) {
            onChange(urlValue.trim());
            setShowUrlInput(false);
            setUrlValue("");
            toast.success("Đã cập nhật URL");
        }
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-sm font-medium text-gray-300">{label}</label>
            )}

            {/* Preview */}
            {value && (
                <div className="relative inline-block">
                    <div className="w-32 h-32 border-2 border-white/20 rounded-lg overflow-hidden bg-white/5">
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                // Prevent infinite loop - only set once
                                if (!img.dataset.errorHandled) {
                                    img.dataset.errorHandled = "true";
                                    img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-size='14' fill='%239ca3af' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange("")}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Upload Options */}
            <div className="flex flex-col gap-2">
                {/* File Upload */}
                <label className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">
                        {uploading ? "Đang upload..." : "Tải ảnh lên"}
                    </span>
                    <input
                        type="file"
                        accept={accept}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>

                {/* URL Input Toggle */}
                {!showUrlInput ? (
                    <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition text-sm"
                    >
                        <ImageIcon className="w-4 h-4" />
                        <span>Hoặc nhập URL</span>
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={urlValue}
                            onChange={(e) => setUrlValue(e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleUrlSubmit();
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={handleUrlSubmit}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition text-sm"
                        >
                            OK
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowUrlInput(false);
                                setUrlValue("");
                            }}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
                        >
                            Hủy
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}


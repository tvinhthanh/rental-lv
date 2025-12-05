"use client";

import { useSettings } from "@/contexts/SettingsContext";

export default function AboutPage() {
    const { settings, loading } = useSettings();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const content = settings?.aboutContent || "<p>Nội dung đang được cập nhật...</p>";

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                    Về chúng tôi
                </h1>
                <div 
                    className="prose prose-invert max-w-none text-gray-200"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </div>
        </div>
    );
}

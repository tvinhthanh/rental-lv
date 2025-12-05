"use client";

import { useSettings } from "@/contexts/SettingsContext";
import Link from "next/link";

export default function SitemapPage() {
    const { settings, loading } = useSettings();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b1424] text-white flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b1424] text-white">
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                    Sitemap
                </h1>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Trang chủ</h2>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-blue-200 hover:text-cyan-300">Trang chủ</Link></li>
                            <li><Link href="/user/cars" className="text-blue-200 hover:text-cyan-300">Xe cho thuê</Link></li>
                            <li><Link href="/user/bookings" className="text-blue-200 hover:text-cyan-300">Đặt xe</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Thông tin</h2>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-blue-200 hover:text-cyan-300">Về chúng tôi</Link></li>
                            <li><Link href="/terms" className="text-blue-200 hover:text-cyan-300">Điều khoản</Link></li>
                            <li><Link href="/privacy" className="text-blue-200 hover:text-cyan-300">Bảo mật</Link></li>
                            <li><Link href="/contact" className="text-blue-200 hover:text-cyan-300">Liên hệ</Link></li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}


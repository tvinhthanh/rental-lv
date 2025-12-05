"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Footer() {
    const [email, setEmail] = useState("");
    const { settings } = useSettings();
    
    const socialUrls = {
        facebook: settings?.facebookUrl || "",
        instagram: settings?.instagramUrl || "",
        youtube: settings?.youtubeUrl || "",
    };
    
    const siteInfo = {
        name: settings?.siteName || "Rental System",
        description: settings?.siteDescription || "Dịch vụ cho thuê xe chuyên nghiệp, uy tín. Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7.",
        logo: settings?.siteLogo || "",
        favicon: settings?.favicon || "",
    };

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email subscription
<<<<<<< HEAD
=======
        console.log("Subscribe:", email);
>>>>>>> b9b3026 (update layout)
        setEmail("");
    };

    return (
        <footer className="w-full bg-[#0b1424] text-white border-t border-white/10">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                {/* Mobile: 3 rows, Desktop: 12 columns grid */}
                <div className="flex flex-col space-y-6 sm:space-y-8 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 mb-6 sm:mb-8">
                    {/* Row 1 Mobile / Column 1-3 Desktop: Logo & Description */}
                    <div className="space-y-3 sm:space-y-4 lg:col-span-3">
                        <Link href="/" className="inline-block">
                            <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                                {(siteInfo.name || "RENTAL SYSTEM").toUpperCase()}
                            </h3>
                        </Link>
                        <p className="text-blue-100 text-xs sm:text-sm leading-relaxed">
                            {siteInfo.description || "Dịch vụ cho thuê xe chuyên nghiệp, uy tín. Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7."}
                        </p>
                        <div className="flex gap-3 sm:gap-4 pt-2">
                            {socialUrls.facebook && (
                                <a
                                    href={socialUrls.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {socialUrls.instagram && (
                                <a
                                    href={socialUrls.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                            )}
                            {socialUrls.youtube && (
                                <a
                                    href={socialUrls.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition active:scale-95"
                                    aria-label="Youtube"
                                >
                                    <Youtube className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Row 2 Mobile (2 columns) / Columns 4-6 Desktop: Danh mục & Chính sách */}
                    <div className="grid grid-cols-2 lg:contents gap-4 sm:gap-6 lg:gap-0">
                        {/* Column: Danh mục */}
                        <div className="lg:col-span-3">
                            <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Danh mục</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            <li>
                                <Link href="/user/cars" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Xe cho thuê
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/bookings" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Đặt xe
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/membership" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Gói thành viên
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/invoices" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Hóa đơn
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/profile" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Tài khoản
                                </Link>
                            </li>
                        </ul>
                        </div>

                        {/* Column: Chính sách */}
                        <div className="lg:col-span-3">
                        <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Chính sách</h4>
                        <ul className="space-y-2 sm:space-y-3">
                            <li>
                                <Link href="/user/about" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Về chúng tôi
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/terms" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/privacy" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Chính sách bảo mật
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/refund" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Chính sách hoàn tiền
                                </Link>
                            </li>
                            <li>
                                <Link href="/user/contact" className="text-blue-100 hover:text-cyan-300 transition text-sm">
                                    Liên hệ
                                </Link>
                            </li>
                        </ul>
                        </div>
                    </div>

                    {/* Row 3 Mobile / Columns 10-12 Desktop: Đăng ký email */}
                    <div className="lg:col-span-3">
                        <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white">Đăng ký nhận tin</h4>
                        <p className="text-blue-100 text-xs sm:text-sm mb-3 sm:mb-4">
                            Nhận thông tin về ưu đãi và tin tức mới nhất từ chúng tôi.
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1 relative">
                                    <Mail className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Nhập email của bạn"
                                        className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/50 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white text-sm sm:text-base font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 active:scale-95 transition"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        </form>
                        <div className="mt-4 sm:mt-6 space-y-2 text-xs sm:text-sm">
                            {settings?.contactAddress && (
                                <div className="flex items-start sm:items-center gap-2 text-blue-100">
                                    <MapPin className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5 sm:mt-0" />
                                    <span className="break-words">{settings.contactAddress}</span>
                                </div>
                            )}
                            {settings?.contactPhone && (
                                <div className="flex items-center gap-2 text-blue-100">
                                    <Phone className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                                    <span>Hotline: {settings.contactPhone}</span>
                                </div>
                            )}
                            {(!settings?.contactAddress && !settings?.contactPhone) && (
                                <>
                                    <div className="flex items-start sm:items-center gap-2 text-blue-100">
                                        <MapPin className="w-4 h-4 text-cyan-300 flex-shrink-0 mt-0.5 sm:mt-0" />
                                        <span className="break-words">123 Đường ABC, Quận 1, TP.HCM</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-100">
                                        <Phone className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                                        <span>Hotline: 1900 1234</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-white/10 pt-6 sm:pt-8 mt-6 sm:mt-8">
                    <div className="flex justify-center items-center">
                        <p className="text-blue-100 text-xs sm:text-sm text-center px-4">
                            © {new Date().getFullYear()} {siteInfo.name || "RentalSystem"} — All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

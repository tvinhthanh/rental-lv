"use client";

import { useState, useEffect } from "react";
import { Save, Key, Globe, Image, Map, Mail, Eye, EyeOff, Settings, FileText, Monitor } from "lucide-react";
import { toast } from "sonner";
import { settingsService } from "@/services/settings.service";
import HtmlEditor from "@/components/editor/html-editor";
import ImageUpload from "@/components/upload/image-upload";

interface SettingsData {
    // Third-party services keys
    googleMapsApiKey: string;
    cloudinaryApiKey: string;
    cloudinaryCloudName: string;
    cloudinaryUploadPreset: string;
    
    // Display settings
    itemsPerPage: number;
    showIcons: boolean;
    defaultLanguage: string;
    
    // Email settings
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    smtpFromEmail: string;
    
    // Social media
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    
    // Site info
    siteName: string;
    siteDescription: string;
    siteLogo: string;
    favicon: string;
    
    // Page content (HTML)
    aboutContent: string;
    termsContent: string;
    privacyContent: string;
    refundContent: string;
    contactContent: string;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<SettingsData>({
        googleMapsApiKey: "",
        cloudinaryApiKey: "",
        cloudinaryCloudName: "",
        cloudinaryUploadPreset: "",
        itemsPerPage: 10,
        showIcons: true,
        defaultLanguage: "vi",
        smtpHost: "",
        smtpPort: "587",
        smtpUser: "",
        smtpPassword: "",
        smtpFromEmail: "",
        facebookUrl: "",
        instagramUrl: "",
        youtubeUrl: "",
        siteName: "Rental System",
        siteDescription: "Car Rental Platform",
        siteLogo: "",
        favicon: "",
        aboutContent: "",
        termsContent: "",
        privacyContent: "",
        refundContent: "",
        contactContent: "",
    });

    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"system" | "website" | "content">("system");

    useEffect(() => {
        // Load settings from localStorage or API
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            // Load from API
            const data = await settingsService.getAll();
            if (data) {
                setSettings(data);
                // Also save to localStorage as backup
                localStorage.setItem("app_settings", JSON.stringify(data));
            }
        } catch (err) {
            console.error("Failed to load settings:", err);
            // Fallback to localStorage
            const saved = localStorage.getItem("app_settings");
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key: keyof SettingsData, value: any) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            
            // Save to API
            await settingsService.update(settings);
            
            // Clear cache to force refresh
            if (typeof window !== "undefined") {
                localStorage.removeItem("public_settings_cache");
                localStorage.removeItem("public_settings_timestamp");
                // Trigger refresh in other components if using context
                window.dispatchEvent(new Event("settingsUpdated"));
            }
            
            toast.success("Đã lưu cài đặt thành công! Trang sẽ tự động cập nhật.");
        } catch (err: any) {
            console.error("Failed to save settings:", err);
            toast.error(err?.message || "Lưu cài đặt thất bại!");
        } finally {
            setSaving(false);
        }
    };

    const togglePasswordVisibility = (key: string) => {
        setShowPasswords((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                        Cài đặt hệ thống
                    </h1>
                    <p className="text-gray-400 mt-1">Quản lý các cấu hình và API keys</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg flex items-center gap-2 disabled:opacity-50"
                >
                    <Save className="w-5 h-5" />
                    {saving ? "Đang lưu..." : "Lưu tất cả"}
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveTab("system")}
                        className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                            activeTab === "system"
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Settings className="w-5 h-5" />
                        Thông tin hệ thống
                    </button>
                    <button
                        onClick={() => setActiveTab("website")}
                        className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                            activeTab === "website"
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <Monitor className="w-5 h-5" />
                        Thông tin website
                    </button>
                    <button
                        onClick={() => setActiveTab("content")}
                        className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                            activeTab === "content"
                                ? "text-cyan-400 border-b-2 border-cyan-400"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        <FileText className="w-5 h-5" />
                        Nội dung trang
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Tab 1: Thông tin hệ thống */}
                {activeTab === "system" && (
                    <>
                        {/* Third-party Services */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Key className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">API Keys & Services</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Google Maps API Key
                            </label>
                            <div className="flex items-center gap-2">
                                <Map className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={settings.googleMapsApiKey}
                                    onChange={(e) => handleChange("googleMapsApiKey", e.target.value)}
                                    placeholder="AIza..."
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Cloudinary Cloud Name
                            </label>
                            <div className="flex items-center gap-2">
                                <Image className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    value={settings.cloudinaryCloudName}
                                    onChange={(e) => handleChange("cloudinaryCloudName", e.target.value)}
                                    placeholder="your-cloud-name"
                                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Cloudinary API Key
                            </label>
                            <input
                                type="text"
                                value={settings.cloudinaryApiKey}
                                onChange={(e) => handleChange("cloudinaryApiKey", e.target.value)}
                                placeholder="123456789012345"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Cloudinary Upload Preset
                            </label>
                            <input
                                type="text"
                                value={settings.cloudinaryUploadPreset}
                                onChange={(e) => handleChange("cloudinaryUploadPreset", e.target.value)}
                                placeholder="your-preset-name"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Eye className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">Cài đặt hiển thị</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Số items mỗi trang
                            </label>
                            <input
                                type="number"
                                value={settings.itemsPerPage}
                                onChange={(e) => handleChange("itemsPerPage", parseInt(e.target.value))}
                                min="5"
                                max="100"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Ngôn ngữ mặc định
                            </label>
                            <select
                                value={settings.defaultLanguage}
                                onChange={(e) => handleChange("defaultLanguage", e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                            >
                                <option value="vi">Tiếng Việt</option>
                                <option value="en">English</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 pt-8">
                            <input
                                type="checkbox"
                                id="showIcons"
                                checked={settings.showIcons}
                                onChange={(e) => handleChange("showIcons", e.target.checked)}
                                className="w-5 h-5 rounded border-white/20 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                            />
                            <label htmlFor="showIcons" className="text-sm font-medium text-gray-300">
                                Hiển thị icons
                            </label>
                        </div>
                    </div>
                </div>

                {/* Email Settings */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Mail className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">Cài đặt Email (SMTP)</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP Host
                            </label>
                            <input
                                type="text"
                                value={settings.smtpHost}
                                onChange={(e) => handleChange("smtpHost", e.target.value)}
                                placeholder="smtp.gmail.com"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP Port
                            </label>
                            <input
                                type="text"
                                value={settings.smtpPort}
                                onChange={(e) => handleChange("smtpPort", e.target.value)}
                                placeholder="587"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP User
                            </label>
                            <input
                                type="text"
                                value={settings.smtpUser}
                                onChange={(e) => handleChange("smtpUser", e.target.value)}
                                placeholder="your-email@gmail.com"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                SMTP Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.smtpPassword ? "text" : "password"}
                                    value={settings.smtpPassword}
                                    onChange={(e) => handleChange("smtpPassword", e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility("smtpPassword")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                >
                                    {showPasswords.smtpPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                From Email
                            </label>
                            <input
                                type="email"
                                value={settings.smtpFromEmail}
                                onChange={(e) => handleChange("smtpFromEmail", e.target.value)}
                                placeholder="noreply@rentalsystem.com"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>
                    </div>
                </div>
                    </>
                )}

                {/* Tab 2: Thông tin website */}
                {activeTab === "website" && (
                    <>
                        {/* Social Media */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-6 h-6 text-cyan-400" />
                                <h2 className="text-xl font-semibold text-white">Mạng xã hội</h2>
                            </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Facebook URL
                            </label>
                            <input
                                type="url"
                                value={settings.facebookUrl}
                                onChange={(e) => handleChange("facebookUrl", e.target.value)}
                                placeholder="https://facebook.com/..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Instagram URL
                            </label>
                            <input
                                type="url"
                                value={settings.instagramUrl}
                                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                                placeholder="https://instagram.com/..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                YouTube URL
                            </label>
                            <input
                                type="url"
                                value={settings.youtubeUrl}
                                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                                placeholder="https://youtube.com/..."
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>
                    </div>
                </div>

                {/* Site Information */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Globe className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-semibold text-white">Thông tin website</h2>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Tên website
                            </label>
                            <input
                                type="text"
                                value={settings.siteName}
                                onChange={(e) => handleChange("siteName", e.target.value)}
                                placeholder="Rental System"
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                            />
                        </div>

                        <div>
                            <ImageUpload
                                value={settings.siteLogo}
                                onChange={(url) => handleChange("siteLogo", url)}
                                label="Logo"
                                placeholder="Nhập URL logo hoặc tải ảnh lên"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Mô tả website
                            </label>
                            <textarea
                                value={settings.siteDescription}
                                onChange={(e) => handleChange("siteDescription", e.target.value)}
                                placeholder="Mô tả về website..."
                                rows={3}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none"
                            />
                        </div>

                        <div>
                            <ImageUpload
                                value={settings.favicon}
                                onChange={(url) => handleChange("favicon", url)}
                                label="Favicon"
                                placeholder="Nhập URL favicon hoặc tải ảnh lên"
                                accept="image/x-icon,image/png,image/jpeg"
                            />
                        </div>
                    </div>
                </div>
                    </>
                )}

                {/* Tab 3: Nội dung trang */}
                {activeTab === "content" && (
                    <>
                        {/* Page Content Settings */}
                        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Globe className="w-6 h-6 text-cyan-400" />
                                <h2 className="text-xl font-semibold text-white">Nội dung trang (HTML)</h2>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Về chúng tôi
                                    </label>
                                    <HtmlEditor
                                        value={settings.aboutContent || ""}
                                        onChange={(value) => handleChange("aboutContent", value)}
                                        placeholder="Nhập nội dung cho trang Về chúng tôi..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Điều khoản sử dụng
                                    </label>
                                    <HtmlEditor
                                        value={settings.termsContent || ""}
                                        onChange={(value) => handleChange("termsContent", value)}
                                        placeholder="Nhập nội dung cho trang Điều khoản..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Chính sách bảo mật
                                    </label>
                                    <HtmlEditor
                                        value={settings.privacyContent || ""}
                                        onChange={(value) => handleChange("privacyContent", value)}
                                        placeholder="Nhập nội dung cho trang Bảo mật..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Chính sách hoàn tiền
                                    </label>
                                    <HtmlEditor
                                        value={settings.refundContent || ""}
                                        onChange={(value) => handleChange("refundContent", value)}
                                        placeholder="Nhập nội dung cho trang Hoàn tiền..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Liên hệ
                                    </label>
                                    <HtmlEditor
                                        value={settings.contactContent || ""}
                                        onChange={(value) => handleChange("contactContent", value)}
                                        placeholder="Nhập nội dung cho trang Liên hệ..."
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}


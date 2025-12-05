/**
 * Settings utility to get and manage app settings
 */

import { settingsService } from "@/services/settings.service";

interface AppSettings {
    googleMapsApiKey: string;
    cloudinaryApiKey: string;
    cloudinaryCloudName: string;
    cloudinaryUploadPreset: string;
    itemsPerPage: number;
    showIcons: boolean;
    defaultLanguage: string;
    smtpHost: string;
    smtpPort: string;
    smtpUser: string;
    smtpPassword: string;
    smtpFromEmail: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    siteName: string;
    siteDescription: string;
    siteLogo: string;
    favicon: string;
}

const defaultSettings: AppSettings = {
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
};

/**
 * Get settings from API, localStorage, or return defaults
 */
export async function getSettings(): Promise<AppSettings> {
    if (typeof window === "undefined") {
        return defaultSettings;
    }

    try {
        // Try to load from API first
        const apiSettings = await settingsService.getAll();
        if (apiSettings && typeof apiSettings === 'object') {
            // Cache in localStorage
            localStorage.setItem("app_settings", JSON.stringify(apiSettings));
            return { ...defaultSettings, ...apiSettings };
        }
    } catch (err: any) {
        // Only log if it's not a 404 or network error (expected when API not ready)
        if (err?.status !== 404 && err?.message !== 'Failed to fetch') {
            console.warn("Failed to load settings from API:", err?.message || err);
        }
    }

    // Fallback to localStorage
    try {
        const saved = localStorage.getItem("app_settings");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                return { ...defaultSettings, ...parsed };
            }
        }
    } catch (err) {
        // Silent fail for localStorage
    }

    return defaultSettings;
}

/**
 * Get settings synchronously from localStorage (for initial render)
 */
export function getSettingsSync(): AppSettings {
    if (typeof window === "undefined") {
        return defaultSettings;
    }

    try {
        const saved = localStorage.getItem("app_settings");
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...defaultSettings, ...parsed };
        }
    } catch (err) {
        console.error("Failed to load settings:", err);
    }

    return defaultSettings;
}

/**
 * Get a specific setting value (synchronous)
 */
export function getSetting<K extends keyof AppSettings>(key: K): AppSettings[K] {
    const settings = getSettingsSync();
    return settings[key];
}

/**
 * Update a setting value
 */
export function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
): void {
    if (typeof window === "undefined") return;

    try {
<<<<<<< HEAD
        const settings = getSettingsSync();
=======
        const settings = getSettings();
>>>>>>> b9b3026 (update layout)
        settings[key] = value;
        localStorage.setItem("app_settings", JSON.stringify(settings));
    } catch (err) {
        console.error("Failed to update setting:", err);
    }
}

/**
 * Get Google Maps API Key
 */
export function getGoogleMapsApiKey(): string {
    return getSetting("googleMapsApiKey") || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
}

/**
 * Get Cloudinary config
 */
export function getCloudinaryConfig() {
<<<<<<< HEAD
    const settings = getSettingsSync();
=======
    const settings = getSettings();
>>>>>>> b9b3026 (update layout)
    return {
        cloudName: settings.cloudinaryCloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
        apiKey: settings.cloudinaryApiKey || process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "",
        uploadPreset: settings.cloudinaryUploadPreset || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
    };
}

/**
 * Get social media URLs
 */
export function getSocialMediaUrls() {
<<<<<<< HEAD
    const settings = getSettingsSync();
=======
    const settings = getSettings();
>>>>>>> b9b3026 (update layout)
    return {
        facebook: settings.facebookUrl,
        instagram: settings.instagramUrl,
        youtube: settings.youtubeUrl,
    };
}

/**
 * Get site information
 */
export function getSiteInfo() {
<<<<<<< HEAD
    const settings = getSettingsSync();
=======
    const settings = getSettings();
>>>>>>> b9b3026 (update layout)
    return {
        name: settings.siteName,
        description: settings.siteDescription,
        logo: settings.siteLogo,
        favicon: settings.favicon,
    };
}


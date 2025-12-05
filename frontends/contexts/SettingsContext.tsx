"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { settingsService } from "@/services/settings.service";

interface PublicSettings {
    siteName: string;
    siteDescription: string;
    siteLogo: string;
    favicon: string;
    facebookUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    itemsPerPage: number;
    showIcons: boolean;
    defaultLanguage: string;
<<<<<<< HEAD
    contactAddress?: string;
    contactPhone?: string;
=======
>>>>>>> b9b3026 (update layout)
    aboutContent?: string;
    termsContent?: string;
    privacyContent?: string;
    refundContent?: string;
    contactContent?: string;
}

interface SettingsContextType {
    settings: PublicSettings | null;
    loading: boolean;
    refresh: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    refresh: async () => {},
});

const CACHE_KEY = "public_settings_cache";
const CACHE_TIMESTAMP_KEY = "public_settings_timestamp";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);

    const loadFromCache = (): PublicSettings | null => {
        if (typeof window === "undefined") return null;

        try {
            const cached = localStorage.getItem(CACHE_KEY);
            const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

            if (cached && timestamp) {
                const cacheTime = parseInt(timestamp, 10);
                const now = Date.now();

                // Check if cache is still valid (within 5 minutes)
                if (now - cacheTime < CACHE_DURATION) {
                    return JSON.parse(cached);
                }
            }
        } catch (err) {
            console.error("Failed to load from cache:", err);
        }

        return null;
    };

    const saveToCache = (data: PublicSettings) => {
        if (typeof window === "undefined") return;

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (err) {
            console.error("Failed to save to cache:", err);
        }
    };

    const fetchSettingsInBackground = useCallback(async () => {
        try {
            const data = await settingsService.getPublic();
            if (data) {
                setSettings(data);
                saveToCache(data);
            }
<<<<<<< HEAD
        } catch (err: any) {
            // Silent fail for background fetch - only log unexpected errors
            if (err?.response?.status !== 404 && err?.message !== "Network Error") {
                console.warn("Background settings fetch failed:", err);
            }
=======
        } catch (err) {
            // Silent fail for background fetch
>>>>>>> b9b3026 (update layout)
        }
    }, []);

    const fetchSettings = useCallback(async (force = false) => {
        // Check cache first if not forcing
        if (!force) {
            const cached = loadFromCache();
            if (cached) {
                setSettings(cached);
                setLoading(false);
                setIsInitialized(true);
                // Fetch in background to update cache
                fetchSettingsInBackground();
                return;
            }
        }

        try {
            setLoading(true);
            const data = await settingsService.getPublic();
            if (data) {
                setSettings(data);
                saveToCache(data);
            }
<<<<<<< HEAD
        } catch (err: any) {
            // Only log if it's not a 404 or network error (expected for first load)
            if (err?.response?.status !== 404 && err?.message !== "Network Error") {
                console.warn("Failed to fetch settings:", err);
            }
=======
        } catch (err) {
            console.error("Failed to fetch settings:", err);
>>>>>>> b9b3026 (update layout)
            // Try to use cache even if expired
            const cached = loadFromCache();
            if (cached) {
                setSettings(cached);
<<<<<<< HEAD
            } else {
                // Set default settings if no cache available
                setSettings({
                    siteName: "Rental System",
                    siteDescription: "Dịch vụ cho thuê xe chuyên nghiệp, uy tín. Đội xe đời mới, bảo hiểm đầy đủ, hỗ trợ 24/7.",
                    siteLogo: "",
                    favicon: "",
                    facebookUrl: "",
                    instagramUrl: "",
                    youtubeUrl: "",
                    itemsPerPage: 20,
                    showIcons: true,
                    defaultLanguage: "vi",
                });
=======
>>>>>>> b9b3026 (update layout)
            }
        } finally {
            setLoading(false);
            setIsInitialized(true);
        }
    }, [fetchSettingsInBackground]);

    const refresh = useCallback(async () => {
        await fetchSettings(true);
    }, [fetchSettings]);

    useEffect(() => {
        // Only load once when component mounts
        if (!isInitialized) {
            fetchSettings(false);
        }
    }, [isInitialized]);

    useEffect(() => {
        // Listen for settings updates
        const handleSettingsUpdate = () => {
            fetchSettings(true);
        };

        if (typeof window !== "undefined") {
            window.addEventListener("settingsUpdated", handleSettingsUpdate);
            return () => {
                window.removeEventListener("settingsUpdated", handleSettingsUpdate);
            };
        }
    }, [fetchSettings]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refresh }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within SettingsProvider");
    }
    return context;
}


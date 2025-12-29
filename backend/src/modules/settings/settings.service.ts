import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSettingsDto } from './dto/create-settings.dto';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) {}

    // Default settings values
    private readonly defaultSettings: Record<string, any> = {
        googleMapsApiKey: '',
        cloudinaryApiKey: '',
        cloudinaryCloudName: '',
        cloudinaryUploadPreset: '',
        itemsPerPage: 10,
        showIcons: true,
        defaultLanguage: 'vi',
        smtpHost: '',
        smtpPort: '587',
        smtpUser: '',
        smtpPassword: '',
        smtpFromEmail: '',
        facebookUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        siteName: 'Rental System',
        siteDescription: 'Car Rental Platform',
        siteLogo: '',
        favicon: '',
    };

    async getSettings() {
        // Get all settings keys
        const allSettings = await this.prisma.systemConfig.findMany({
            where: {
                key: {
                    in: Object.keys(this.defaultSettings)
                }
            }
        });

        // Build settings object from database
        const settings: Record<string, any> = { ...this.defaultSettings };
        
        for (const setting of allSettings) {
            try {
                // Try to parse as JSON first, if fails use as string
                let value = setting.value;
                try {
                    value = JSON.parse(setting.value);
                } catch {
                    // Keep as string if not valid JSON
                }
                settings[setting.key] = value;
            } catch (err) {
                // Skip invalid entries
            }
        }

        return settings;
    }

    async updateSettings(dto: CreateSettingsDto) {
        const updatedSettings: Record<string, any> = {};

        // Update each setting key individually
        for (const [key, value] of Object.entries(dto)) {
            if (value !== undefined && value !== null) {
                // Convert value to string (handle objects/arrays as JSON)
                const stringValue = typeof value === 'string' 
                    ? value 
                    : JSON.stringify(value);

                // Upsert each setting
                await this.prisma.systemConfig.upsert({
                    where: { key },
                    update: {
                        value: stringValue,
                        updatedAt: new Date()
                    },
                    create: {
                        key,
                        value: stringValue,
                        description: `Setting: ${key}`,
                        category: 'app_settings'
                    }
                });

                // Store parsed value for response
                updatedSettings[key] = typeof value === 'string' ? value : JSON.parse(stringValue);
            }
        }

        // Return all current settings
        return this.getSettings();
    }

    async getSetting(key: string) {
        const setting = await this.prisma.systemConfig.findUnique({
            where: { key }
        });

        if (!setting) {
            return this.defaultSettings[key] || null;
        }

        try {
            // Try to parse as JSON, if fails return as string
            return JSON.parse(setting.value);
        } catch {
            return setting.value;
        }
    }

    // Public settings that can be cached (no sensitive data)
    async getPublicSettings() {
        const publicKeys = [
            'siteName',
            'siteDescription',
            'siteLogo',
            'favicon',
            'facebookUrl',
            'instagramUrl',
            'youtubeUrl',
            'itemsPerPage',
            'showIcons',
            'defaultLanguage',
            // Page content (HTML)
            'aboutContent',
            'termsContent',
            'privacyContent',
            'refundContent',
            'contactContent',
        ];

        const settings = await this.prisma.systemConfig.findMany({
            where: {
                key: {
                    in: publicKeys
                }
            }
        });

        const result: Record<string, any> = {};
        
        for (const key of publicKeys) {
            const setting = settings.find((s: any) => s.key === key);
            if (setting) {
                try {
                    result[key] = JSON.parse(setting.value);
                } catch {
                    result[key] = setting.value;
                }
            } else {
                result[key] = this.defaultSettings[key];
            }
        }

        return result;
    }
}


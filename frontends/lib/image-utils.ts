/**
 * Convert image URL to WebP format
 * @param url - Original image URL
 * @returns WebP formatted URL
 */
import { getPlaceholderImage } from "./image-placeholder";

export function toWebP(url: string | undefined | null): string {
    if (!url) return getPlaceholderImage();
    
    // Already WebP
    if (url.includes('.webp') || url.includes('format=webp')) {
        return url;
    }
    
    // External URLs (Unsplash, etc) - add format parameter
    if (url.startsWith('http')) {
        if (url.includes('unsplash.com')) {
            // Remove existing format params and add webp
            const cleanUrl = url.replace(/[?&]format=\w+/g, '').replace(/[?&]auto=format/g, '');
            const separator = cleanUrl.includes('?') ? '&' : '?';
            return `${cleanUrl}${separator}format=webp&auto=format`;
        }
        // Other external URLs
        if (url.includes('?')) {
            return `${url}&format=webp`;
        }
        return `${url}?format=webp`;
    }
    
    // Local files - replace extension
    if (url.includes('.')) {
        const extMatch = url.match(/\.(jpg|jpeg|png|JPG|JPEG|PNG)(\?|$)/);
        if (extMatch) {
            return url.replace(extMatch[0], '.webp' + (extMatch[2] || ''));
        }
    }
    
    return url;
}

/**
 * Get image loading attribute based on priority
 * @param priority - Whether image should load immediately
 * @returns "eager" or "lazy"
 */
export function getImageLoading(priority: boolean = false): "eager" | "lazy" {
    return priority ? "eager" : "lazy";
}


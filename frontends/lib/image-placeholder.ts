/**
 * Get a placeholder image data URL instead of requesting a file
 * This prevents 404 errors and infinite retry loops
 * @param width - Image width (default: 200)
 * @param height - Image height (default: 150)
 */
export function getPlaceholderImage(width: number = 200, height: number = 150): string {
    // SVG placeholder as data URL
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">No Image</text></svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * Check if an image URL is valid, return placeholder if not
 * @param url - Image URL to check
 * @param width - Placeholder width (default: 200)
 * @param height - Placeholder height (default: 150)
 */
export function getImageUrl(url: string | undefined | null, width?: number, height?: number): string {
    if (!url || url.trim() === "" || url === "/no-image.png") {
        return getPlaceholderImage(width, height);
    }
    return url;
}


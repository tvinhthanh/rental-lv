"use client";

import { useState } from "react";

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    priority?: boolean;
    fallback?: string;
}

export default function OptimizedImage({
    src,
    alt,
    className = "",
    width,
    height,
    priority = false,
    fallback,
}: OptimizedImageProps) {
    const [imageSrc, setImageSrc] = useState<string>(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Convert to WebP if not already
    const getWebPSrc = (url: string): string => {
        // If already WebP, return as is
        if (url.includes('.webp') || url.includes('format=webp')) {
            return url;
        }
        
        // If external URL (unsplash, etc), add format=webp
        if (url.startsWith('http')) {
            if (url.includes('?')) {
                return `${url}&format=webp`;
            }
            return `${url}?format=webp`;
        }
        
        // If local file, try to convert extension
        if (url.includes('.')) {
            const parts = url.split('.');
            const ext = parts.pop();
            if (ext && ['jpg', 'jpeg', 'png'].includes(ext.toLowerCase())) {
                return `${parts.join('.')}.webp`;
            }
        }
        
        return url;
    };

    const webpSrc = getWebPSrc(imageSrc);

    const handleError = () => {
        if (fallback) {
            setImageSrc(fallback);
            setHasError(false);
        } else if (imageSrc !== src) {
            // Fallback to original if WebP fails
            setImageSrc(src);
            setHasError(false);
        } else {
            setHasError(true);
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    if (hasError) {
        return (
            <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
                <span className="text-gray-400 text-sm">Không tải được ảnh</span>
            </div>
        );
    }

    return (
        <div className={`relative ${className}`} style={{ width, height }}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
            )}
            <img
                src={webpSrc}
                alt={alt}
                className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}`}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}


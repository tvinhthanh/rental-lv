"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";

export default function MapPicker({ onSelect, onClose }: any) {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Init map
        const map = L.map(mapRef.current).setView([10.762622, 106.660172], 13);

        // Load free map tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        let marker: any = null;

        // On Click
        map.on("click", function (e: any) {
            const { lat, lng } = e.latlng;

            // replace marker
            if (marker) map.removeLayer(marker);

            marker = L.marker([lat, lng]).addTo(map);

            onSelect({ lat, lng });
        });

        return () => {
            map.remove();
        };
    }, []);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-3 rounded w-[600px] h-[500px] relative shadow-xl">
                <button
                    className="absolute top-2 right-2 text-xl"
                    onClick={onClose}
                >
                    ✕
                </button>

                <div ref={mapRef} className="w-full h-full rounded" />
            </div>
        </div>
    );
}

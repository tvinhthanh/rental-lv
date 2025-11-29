// "use client";

// import { useEffect, useRef } from "react";
// import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// export default function GoogleMapPicker({ onSelect, onClose }: any) {
//     const mapRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY) {
//             console.error("Missing NEXT_PUBLIC_GOOGLE_MAP_KEY");
//             return;
//         }

//         async function initMap() {
//             // Cấu hình toàn cục
//             setOptions({
//                 apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_KEY!
//             });

//             // Import library mới
//             const { Map } = await importLibrary("maps") as google.maps.MapsLibrary;
//             const { event } = await importLibrary("core") as google.maps.CoreLibrary;

//             if (!mapRef.current) return;

//             const map = new Map(mapRef.current, {
//                 center: { lat: 10.762622, lng: 106.660172 },
//                 zoom: 13,
//             });

//             // Click để lấy Lat/Lng
//             event.addListener(map, "click", (e: any) => {
//                 if (!e.latLng) return;
//                 onSelect({
//                     lat: e.latLng.lat(),
//                     lng: e.latLng.lng()
//                 });
//             });
//         }

//         initMap();
//     }, []);

//     return (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//             <div className="bg-white p-3 rounded w-[600px] h-[500px] relative shadow-xl">
//                 <button
//                     className="absolute top-2 right-2 text-xl"
//                     onClick={onClose}
//                 >
//                     ✕
//                 </button>

//                 <div
//                     ref={mapRef}
//                     className="w-full h-full rounded"
//                 />
//             </div>
//         </div>
//     );
// }

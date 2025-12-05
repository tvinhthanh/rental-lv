"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

export default function BranchMap() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lazy load map when section is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !shouldLoad) {
            setShouldLoad(true);
          }
        });
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        observer.unobserve(mapRef.current);
      }
    };
  }, [shouldLoad]);

  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.403987842262!2d106.70062717631097!3d10.779783159135654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3de6127f75%3A0x5cf9353e8542fa74!2zTmdoIMO0IEPDtG5nIFRoxqFuZyBUaMO0bmcgUXXhuq1uIDE!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s";

  return (
    <section className="py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1f3a] via-[#0a1e36] to-[#0b1424]" />
      <div className="max-w-6xl mx-auto relative px-4">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-200">Chi nhánh</p>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">Đón xe tại vị trí thuận tiện</h2>
            </div>
          </div>
          <a
            href="/user/cars"
            className="px-4 py-2 bg-white text-[#0b1f3a] rounded-lg font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Xem xe gần bạn
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {["Hà Nội", "Đà Nẵng", "TP. HCM"].map((city) => (
            <div key={city} className="bg-white/5 border border-white/10 rounded-xl p-4 text-white">
              <p className="font-semibold text-lg">{city}</p>
              <p className="text-sm text-blue-100 mt-1">Nhận xe tại trung tâm, hỗ trợ giao xe tận nơi.</p>
            </div>
          ))}
        </div>

        <div 
          ref={mapRef}
          className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-white/5"
          style={{ minHeight: "420px" }}
        >
          {!shouldLoad ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-200 text-sm">Đang tải bản đồ...</p>
              </div>
            </div>
          ) : (
            <>
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-blue-200 text-sm">Đang tải bản đồ...</p>
                  </div>
                </div>
              )}
          <iframe
            width="100%"
            height="420"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
                src={mapUrl}
                onLoad={() => setMapLoaded(true)}
                className={mapLoaded ? "opacity-100 transition-opacity duration-500" : "opacity-0"}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}

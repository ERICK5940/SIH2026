"use client";
import { useEffect, useRef } from "react";

export default function FieldMiniMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    if (mapInstRef.current) return; // already init
    if ((mapRef.current as any)._leaflet_id) return;
    let cancelled = false;
    (async () => {
      const leaflet: any = await import("leaflet");
      try { await import("leaflet/dist/leaflet.css"); } catch {}
      if (cancelled) return;
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      if (!mapRef.current || (mapRef.current as any)._leaflet_id) return;
      const map = leaflet.map(mapRef.current).setView([lat, lng], 14);
      mapInstRef.current = map;
      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);
      markerRef.current = leaflet.marker([lat, lng]).addTo(map);
      setTimeout(() => { try { map.invalidateSize(); } catch {} }, 200);
    })();
    return () => { cancelled = true; };
  }, [lat, lng]);

  useEffect(() => {
    if (mapInstRef.current && markerRef.current && lat && lng) {
      try {
        mapInstRef.current.setView([lat, lng], 14);
        markerRef.current.setLatLng([lat, lng]);
        setTimeout(() => { try { mapInstRef.current.invalidateSize(); } catch {} }, 100);
      } catch {}
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg border bg-slate-100 z-0" />;
}

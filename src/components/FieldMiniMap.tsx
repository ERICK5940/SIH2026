"use client";
import { useEffect, useRef } from "react";

export default function FieldMiniMap({ lat, lng }: { lat: number | null; lng: number | null }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstRef = useRef<any>(null);

  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;
    let cancelled = false;
    import("maplibre-gl").then((mod) => {
      if (cancelled) return;
      const maplibregl = (mod as any).default || mod;
      import("maplibre-gl/dist/maplibre-gl.css");
      if (mapInstRef.current) return;
      const map = new maplibregl.Map({
        container: mapRef.current!,
        style: "https://tiles.openfreemap.org/styles/bright",
        center: [lng, lat],
        zoom: 12,
      });
      mapInstRef.current = map;
      new maplibregl.Marker().setLngLat([lng, lat]).addTo(map);
      map.on("load", () => map.resize());
    });
    return () => { cancelled = true; };
  }, [lat, lng]);

  useEffect(() => {
    if (mapInstRef.current && lat && lng) {
      mapInstRef.current.setCenter([lng, lat]);
      mapInstRef.current.setZoom(12);
    }
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-64 rounded-lg border bg-slate-100" />;
}

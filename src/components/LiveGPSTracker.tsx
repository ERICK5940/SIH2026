"use client";

import React, { useState, useEffect, useRef } from "react";

export function LiveGPSTracker() {
  const [sharing, setSharing] = useState(false);
  const [simulating, setSimulating] = useState(true);
  const [status, setStatus] = useState("Simulating live movement along NH-37/52");
  const watchRef = useRef<number | null>(null);
  const simRef = useRef<any>(null);

  // Simulated movement - moves NER-1024,25,26 along exact NH corridors via API
  useEffect(() => {
    if (!simulating) return;
    const routes: Record<string, [number, number][]> = {
      "NER-1024": [[26.14,91.73],[26.35,92.68],[26.75,94.2],[27.0,94.5],[26.5,93.0],[24.82,92.79]],
      "NER-1025": [[27.48,94.91],[27.7,95.36],[28.07,95.33]],
      "NER-1026": [[26.63,92.79],[27.06,93.62],[27.3,93.5]],
    };
    const idx: Record<string, number> = { "NER-1024": 0, "NER-1025": 0, "NER-1026": 0 };
    simRef.current = setInterval(async () => {
      for (const id of Object.keys(routes)) {
        const path = routes[id];
        idx[id] = (idx[id] + 1) % path.length;
        const [lat, lng] = path[idx[id]];
        await fetch("/api/gps/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, lat, lng, cargo: id==="NER-1024"?"medicines": id==="NER-1025"?"food":"construction", currentLocation: `${lat.toFixed(2)},${lng.toFixed(2)}` }),
        }).catch(()=>{});
      }
      setStatus(`Simulated • ${new Date().toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata"})} IST • 5 min interval`);
    }, 300000);
    return () => clearInterval(simRef.current);
  }, [simulating]);

  const startSharing = () => {
    if (!navigator.geolocation) { setStatus("Geolocation not supported"); return; }
    setSharing(true);
    setStatus("Sharing live location…");
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, speed } = pos.coords;
        await fetch("/api/gps/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: "NER-1024", lat, lng, cargo: "medicines", currentLocation: `${lat.toFixed(4)},${lng.toFixed(4)}`, speedKph: speed ? Math.round(speed*3.6) : undefined }),
        });
        setStatus(`Live • ${lat.toFixed(4)},${lng.toFixed(4)} • ${new Date().toLocaleTimeString()}`);
      },
      (err) => setStatus("Error: " + err.message),
      { enableHighAccuracy: true, maximumAge: 0 }
    ) as unknown as number;
  };

  const stopSharing = () => {
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current as any);
    setSharing(false);
    setStatus("Stopped sharing");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${sharing ? "bg-emerald-500 animate-pulse" : simulating ? "bg-sky-500 animate-pulse" : "bg-slate-400"}`} />
        <span className="text-xs font-black tracking-widest text-slate-900">LIVE GPS</span>
        <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">{status}</span>
      </div>
      <div className="ml-auto flex gap-2">
        {!sharing ? (
          <button onClick={startSharing} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700">📍 Share My Location</button>
        ) : (
          <button onClick={stopSharing} className="px-3 py-1.5 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700">■ Stop Sharing</button>
        )}
        <button onClick={() => setSimulating(!simulating)} className={`px-3 py-1.5 rounded text-xs font-bold border ${simulating ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-700 border-slate-200"}`}>
          {simulating ? "● Simulating" : "○ Simulate"}
        </button>
      </div>
    </div>
  );
}

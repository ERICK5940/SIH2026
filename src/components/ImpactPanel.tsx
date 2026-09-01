"use client";
import { useMemo } from "react";
import { affectedVehicles, nearestHubs } from "@/lib/spatial";

export default function ImpactPanel({ incidents, liveVehicles }: { incidents: any[]; liveVehicles: Record<string, any> }) {
  const last = incidents[0];
  const impact = useMemo(() => {
    if (!last?.location) return null;
    const aff = affectedVehicles({ latitude: last.location.latitude, longitude: last.location.longitude }, liveVehicles, 80);
    const hubs = nearestHubs({ latitude: last.location.latitude, longitude: last.location.longitude }, 3);
    const pop = aff.reduce((s: number, v: any) => s + (v.populationAffected || 0), 0);
    return { aff, hubs, pop };
  }, [last, liveVehicles]);

  if (!last) return null;
  if (!impact) return <div className="text-xs text-zinc-500 p-3">No location for impact</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <h3 className="text-xs font-black tracking-widest">IMPACT ANALYSIS • TURF BUFFER 80KM</h3>
      <p className="text-[11px] text-slate-600 mt-1">Last: {last.type} • {last.severity} • {last.location.latitude.toFixed(2)},{last.location.longitude.toFixed(2)} {last.state ? `• ${last.state}` : ""}</p>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="bg-slate-50 border rounded p-2 text-center"><p className="text-[11px] font-bold">Affected vehicles</p><p className="text-lg font-black text-red-600">{impact.aff.length}</p><p className="text-[10px] truncate">{impact.aff.map((v:any)=>v.id).join(", ")||"—"}</p></div>
        <div className="bg-slate-50 border rounded p-2 text-center"><p className="text-[11px] font-bold">Population affected</p><p className="text-lg font-black">{impact.pop}</p></div>
        <div className="bg-slate-50 border rounded p-2 text-left"><p className="text-[11px] font-bold text-center">Nearest safe hubs (3)</p>{impact.hubs.map((h:any)=><p key={h.id} className="text-[11px] flex justify-between"><span className="font-bold">{h.name}</span><span>{h.distKm}km • {h.district}</span></p>)}</div>
      </div>
    </div>
  );
}

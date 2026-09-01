"use client";
import { useEffect, useState, useMemo } from "react";

function hav(a:number,b:number,c:number,d:number){ const R=6371; const dLa=(c-a)*Math.PI/180; const dLo=(d-b)*Math.PI/180; const s=Math.sin(dLa/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(s)); }

export default function AffectedVehicles({ liveVehicles }: { liveVehicles: Record<string,any> }) {
  const [incidents, setIncidents] = useState<any[]>([]);
  useEffect(()=>{ const load=async()=>{ try{ const r=await fetch("/api/incidents"); const j=await r.json(); setIncidents(j.incidents||[]);}catch{} }; load(); const id=setInterval(load,4000); return()=>clearInterval(id); },[]);
  const last = incidents[0];
  const affected = useMemo(()=>{
    if(!last?.location) return [];
    return Object.values(liveVehicles).filter((v:any)=> v.lat!=null && v.lng!=null && hav(last.location.latitude,last.location.longitude,v.lat,v.lng) < 80);
  },[last, liveVehicles]);
  if(!last) return <div className="bg-white border rounded-lg p-4"><h3 className="text-xs font-black tracking-widest">AFFECTED VEHICLES</h3><p className="text-xs text-slate-500 mt-2">No incidents yet</p></div>;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-xs font-black tracking-widest">AFFECTED VEHICLES • {affected.length} / {Object.keys(liveVehicles).length}</h3>
      <p className="text-[11px] text-slate-600 mt-1">Last: {last.type} {last.severity} • {last.location.latitude.toFixed(2)},{last.location.longitude.toFixed(2)} • 80km radius</p>
      <div className="space-y-2 mt-3">
        {affected.length ? affected.map((v:any)=><div key={v.id} className="border rounded p-2 bg-red-50 border-red-200"><p className="text-xs font-black">{v.id} • {v.currentLocation||v.lat?.toFixed(2)}</p><p className="text-[11px] text-slate-600">{v.cargo} • delay {Math.floor(v.delayMinutes/60)}h {v.delayMinutes%60}m</p></div>) : <p className="text-xs text-emerald-600 font-bold">No vehicles in 80km — all safe</p>}
      </div>
    </div>
  );
}

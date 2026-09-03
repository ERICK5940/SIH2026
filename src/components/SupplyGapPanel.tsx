"use client";
import { HUBS } from "@/lib/hubs";
export default function SupplyGapPanel({ vehicles, incidents }: { vehicles: any[]; incidents: any[] }) {
  // demand per district from vehicles destination
  const demand: Record<string, number> = {};
  vehicles.forEach((v:any)=>{ const d=v.destination||v.currentLocation||"Assam"; const key= HUBS.find(h=> d.includes(h.district))?.district || d.split(" ")[0]; demand[key]=(demand[key]||0)+(v.populationAffected||500); });
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-xs font-black tracking-widest">SUPPLY-GAP INTELLIGENCE • District: Demand vs Supply vs ETA</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
        {Object.entries(demand).slice(0,6).map(([dist, dem])=>{
          const hub=HUBS.find(h=>h.district===dist) || HUBS[0];
          const supply = (hub.stock.medicines + hub.stock.food)*10; // units
          const gap = Math.max(0, (dem as number) - supply);
          const eta = Math.round(120 + gap*0.05);
          return <div key={dist} className="border rounded p-2 bg-slate-50"><p className="text-xs font-black">{dist}</p><p className="text-[11px]">Demand {dem} pop • Supply {supply} units • Gap <span className={gap?"text-red-600 font-black":"text-emerald-600 font-bold"}>{gap}</span></p><p className="text-[11px]">ETA {Math.floor(eta/60)}h {eta%60}m • Hub {hub.name}</p></div>;
        })}
      </div>
    </div>
  );
}

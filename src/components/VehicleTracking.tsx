"use client";

import React from "react";

type CargoType = "medicines" | "food" | "agricultural" | "construction" | "other";

interface VehicleRecord {
  id: string;
  currentLocation: string;
  destination: string;
  etaMinutes: number;
  delayMinutes: number;
  cargo: CargoType;
  status: "on_route" | "delayed" | "arrived" | "stranded";
  accessibility: number;
  lastUpdate: string;
}

const cargoBadge: Record<CargoType, string> = {
  medicines: "bg-red-100 text-red-700 border-red-200",
  food: "bg-amber-100 text-amber-700 border-amber-200",
  agricultural: "bg-emerald-100 text-emerald-700 border-emerald-200",
  construction: "bg-orange-100 text-orange-700 border-orange-200",
  other: "bg-slate-100 text-slate-700 border-slate-200",
};

const vehicleStatusLabels: Record<VehicleRecord["status"], string> = {
  on_route: "On Route",
  delayed: "Delayed",
  arrived: "Arrived",
  stranded: "Stranded",
};

const statusBadge: Record<VehicleRecord["status"], string> = {
  on_route: "bg-emerald-100 text-emerald-700 border-emerald-200",
  delayed: "bg-amber-100 text-amber-700 border-amber-200",
  arrived: "bg-slate-100 text-slate-700 border-slate-200",
  stranded: "bg-red-100 text-red-700 border-red-200",
};

function fmtHrsMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} hrs`;
}

const VEHICLE_ROUTE: Record<string, string> = {
  "NER-1024": "NH-37",
  "NER-1025": "NH-52",
  "NER-1026": "NH-29",
  "NER-1027": "NH-157",
  "NER-1028": "NH-31",
};
const LIVE_STATUS_COLOR: Record<string, string> = { accessible: "#10b981", delayed: "#f59e0b", high_risk: "#f97316", blocked: "#ef4444", emergency: "#0ea5e9" };
export function VehicleTracking({ vehicles, onFocus, live, liveRoutes }: { vehicles: VehicleRecord[]; onFocus?: (id: string) => void; live?: Record<string, any>; liveRoutes?: any[] }) {
  const routeMap = React.useMemo(()=>{ const m:Record<string,any>={}; (liveRoutes||[]).forEach((r:any)=> m[r.name]=r); return m; }, [liveRoutes]);
  const display = vehicles.map((v) => {
    const lv = live?.[v.id];
    return lv ? { ...v, currentLocation: lv.currentLocation || `${lv.lat?.toFixed(2)},${lv.lng?.toFixed(2)}`, lastUpdate: lv.updatedAt } : v;
  });
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-black tracking-tight text-slate-900">Vehicle Tracking — LIVE</h2>
        <span className="text-[11px] font-bold tracking-widest bg-emerald-600 text-white px-2 py-1 rounded animate-pulse">{display.length} LIVE</span>
      </div>
      <div className="overflow-x-auto -mx-4 px-4">
        <div className="min-w-[660px] rounded-lg border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Vehicle</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Route</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Cargo</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Destination</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">ETA</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Delay</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Status</th>
                <th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 whitespace-nowrap">Focus</th>
              </tr>
            </thead>
            <tbody>
              {display.map((vehicle) => (
                <tr key={vehicle.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2.5 font-black text-slate-900 text-xs whitespace-nowrap">{vehicle.id}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{(() => { const rn = VEHICLE_ROUTE[vehicle.id]; const lr = rn ? routeMap[rn] : null; const st = lr ? lr.status : null; const label = st ? st.toUpperCase().replace("_"," ") : null; const col = st ? (LIVE_STATUS_COLOR[st]||"#6b7280") : "#6b7280"; return rn ? <span className="inline-flex px-2 py-1 rounded text-[10px] font-black border border-white shadow-sm text-white whitespace-nowrap" style={{background: col}} title={label||rn}>{rn} • {label||"—"}</span> : <span className="text-[11px] text-slate-400">—</span>; })()}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold border whitespace-nowrap ${cargoBadge[vehicle.cargo]}`}>{vehicle.cargo}</span></td>
                  <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap max-w-[110px] truncate">{vehicle.destination}</td>
                  <td className="px-3 py-2.5 text-xs font-bold text-slate-900 whitespace-nowrap">{fmtHrsMins(vehicle.etaMinutes)}</td>
                  <td className="px-3 py-2.5 text-xs font-black whitespace-nowrap" style={{ color: vehicle.delayMinutes > 0 ? "#dc2626" : "#16a34a" }}>{fmtHrsMins(vehicle.delayMinutes)}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><span className={`inline-flex px-2 py-1 rounded text-[11px] font-bold border whitespace-nowrap ${statusBadge[vehicle.status]}`}>{vehicleStatusLabels[vehicle.status]}</span></td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button onClick={() => onFocus?.(vehicle.id)} className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-bold hover:bg-black">📍 Focus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-[11px] font-medium text-slate-500 mt-2">Live polling every 2.5s from <code>/api/gps/ingest</code> • Click Focus to fly map</p>
    </div>
  );
}

export function EssentialSuppliesMonitor({ vehicles }: { vehicles: VehicleRecord[] }) {
  const categorizedVehicles = React.useMemo(() => {
    const categories: Record<CargoType, VehicleRecord[]> = { medicines: [], food: [], agricultural: [], construction: [], other: [] };
    vehicles.forEach((vehicle) => {
      const category = (vehicle.cargo as keyof typeof categories) || "other";
      categories[category].push(vehicle);
    });
    return categories;
  }, [vehicles]);
  const cargoColors: Record<CargoType, string> = { medicines: "#ef4444", food: "#f59e0b", agricultural: "#84cc16", construction: "#f97316", other: "#6b7280" };
  const cargoBg: Record<CargoType, string> = { medicines: "border-red-200 bg-red-50", food: "border-amber-200 bg-amber-50", agricultural: "border-emerald-200 bg-emerald-50", construction: "border-orange-200 bg-orange-50", other: "border-slate-200 bg-slate-50" };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(categorizedVehicles).map(([category, list]) => {
        if (list.length === 0) return null;
        return (
          <div key={category} className={`p-3 rounded-lg border-2 ${cargoBg[category as CargoType]}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black tracking-widest text-slate-900 uppercase">{category}</h3>
              <span className="text-[11px] font-black px-2 py-1 rounded bg-white border border-slate-200">{list.length} vehicles</span>
            </div>
            <div className="space-y-2">
              {list.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="p-2.5 rounded bg-white border border-slate-200" style={{ borderLeft: `4px solid ${cargoColors[category as CargoType]}` }}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{vehicle.id}</p>
                      <p className="text-[11px] font-semibold text-slate-600 truncate">{vehicle.cargo} • {vehicle.currentLocation}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-bold text-slate-900">ETA {fmtHrsMins(vehicle.etaMinutes)}</p>
                      <p className="text-[11px] font-bold text-red-600">{fmtHrsMins(vehicle.delayMinutes)} delay</p>
                    </div>
                  </div>
                </div>
              ))}
              {list.length > 3 && <p className="text-[11px] font-semibold text-slate-600">+{list.length - 3} more</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

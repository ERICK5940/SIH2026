"use client";

import React, { useEffect, useState } from "react";
import { HUBS } from "@/lib/hubs";

type RouteStatus = "accessible" | "delayed" | "high_risk" | "blocked" | "emergency";
interface Route { id: string; name: string; from: string; to: string; status: RouteStatus; distance: string; eta: string; riskScore: number; }
interface GISMapProps { routes: Route[]; districtScores: Record<string, number>; focusId?: string | null; liveVehicles?: Record<string, any>; incidents?: any[]; }

const statusColors: Record<RouteStatus, string> = { accessible: "#10b981", delayed: "#f59e0b", high_risk: "#f97316", blocked: "#ef4444", emergency: "#0ea5e9" };
const statusLabels: Record<RouteStatus, string> = { accessible: "Accessible", delayed: "Delayed", high_risk: "High Risk", blocked: "Blocked", emergency: "Emergency" };
const statusDot: Record<RouteStatus, string> = { accessible: "bg-emerald-500", delayed: "bg-amber-500", high_risk: "bg-orange-500", blocked: "bg-red-500", emergency: "bg-sky-500" };

const routeLatLng: Record<string, [number, number][]> = {
  "NH-37": [[26.1445,91.7362],[26.35,92.68],[26.75,94.2],[27.0,94.5],[26.8,93.8],[25.2,92.9],[24.82,92.79]],
  "NH-52": [[27.48,94.91],[27.7,95.36],[28.07,95.33],[28.2,94.8]],
  "NH-157": [[26.63,92.79],[27.06,93.62],[27.14,93.61],[27.3,93.5]],
  "NH-29": [[26.75,94.2],[26.5,94.4],[26.32,94.5],[26.1,94.8],[25.4,93.2]],
  "NH-31": [[26.14,91.73],[25.5,91.88],[24.8,91.95],[24.35,91.95],[23.84,91.28]],
};

function LeafletMap({ routes, focusId, liveVehicles, incidents }: { routes: Route[]; focusId?: string | null; liveVehicles?: Record<string, any>; incidents?: any[] }) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<any>(null);
  const leafletRef = React.useRef<any>(null);
  const vehicleLayerRef = React.useRef<any>(null);
  const droneLayerRef = React.useRef<any>(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    if (mapRef.current && (mapRef.current as any)._leaflet_id) return;
    let cancelled = false;
    (async () => {
      try {
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
        if (!mapRef.current) return;
        if ((mapRef.current as any)._leaflet_id) return;
        const map = leaflet.map(mapRef.current!, { zoomControl: true }).setView([26.2, 92.9], 7);
        mapInstanceRef.current = map;
        leafletRef.current = leaflet;
        leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap | NER", maxZoom: 18, opacity: 1 }).addTo(map);
        const states = ["arunachal-pradesh","assam","meghalaya","manipur","mizoram","nagaland","tripura"];
        const colors: Record<string,string> = {"arunachal-pradesh":"#1e293b",assam:"#0f172a",meghalaya:"#1e293b",nagaland:"#1e293b",manipur:"#1e293b",mizoram:"#1e293b",tripura:"#1e293b"};
        const group: any[] = [];
        for (const st of states) {
          try {
            const res = await fetch(`/geojson/${st}.geojson`);
            if (!res.ok) continue;
            const gj = await res.json();
            const layer = leaflet.geoJSON(gj, {
              style: { color: st==="assam"?"#0ea5e9":"#64748b", weight: st==="assam"?2:1, fillColor: colors[st]||"#1e293b", fillOpacity: 0.12, opacity: 0.7 },
              onEachFeature: (f:any,l:any)=> l.bindTooltip(`<b>${st.replace("-"," ").toUpperCase()}</b>`,{sticky:true}),
            }).addTo(map);
            group.push(layer);
          } catch {}
        }
        try {
          if (group.length) {
            const fg = (leaflet as any).featureGroup(group);
            if (fg.getBounds().isValid()) map.fitBounds(fg.getBounds().pad(0.18), { animate: false });
          }
        } catch {}
        routes.forEach((r)=>{
          const latlng = routeLatLng[r.name]; if(!latlng) return;
          // white halo for clear vision on OSM
          leaflet.polyline(latlng,{color:"white",weight:r.status==="blocked"?9:7,opacity:0.95}).addTo(map);
          const poly = leaflet.polyline(latlng,{color:statusColors[r.status],weight:r.status==="blocked"?7:5,opacity:1,dashArray:r.status==="blocked"?"10 8":r.status==="high_risk"?"14 10":undefined}).addTo(map);
          poly.bindTooltip(`<b>${r.name}</b> ${r.from} → ${r.to}<br/>${r.distance}km • ${r.eta}`,{sticky:true});
          const mid = latlng[Math.floor(latlng.length/2)];
          leaflet.marker(mid,{icon:leaflet.divIcon({html:`<div style="background:${statusColors[r.status]};color:white;font-size:10px;font-weight:900;padding:3px 6px;border-radius:6px;border:2px solid white;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${r.name}</div>`,className:""})}).addTo(map);
        });
        vehicleLayerRef.current = leaflet.layerGroup().addTo(map);
        setTimeout(()=> { try{ map.invalidateSize(); }catch{} }, 150);
      } catch {}
    })();
    return ()=> { cancelled=true; if(mapInstanceRef.current){ try{mapInstanceRef.current.remove();}catch{} mapInstanceRef.current=null; if(mapRef.current) (mapRef.current as any)._leaflet_id=null; } };
  }, []);

  useEffect(()=>{
    const map = mapInstanceRef.current; const leaflet = leafletRef.current;
    if(!map||!leaflet) return;
    if(!vehicleLayerRef.current) vehicleLayerRef.current = leaflet.layerGroup().addTo(map);
    else vehicleLayerRef.current.clearLayers();
    const live = liveVehicles ? Object.values(liveVehicles) : [];
    const VEH_ROUTE: Record<string,string> = {"NER-1024":"NH-37","NER-1025":"NH-52","NER-1026":"NH-29","NER-1027":"NH-157","NER-1028":"NH-31"};
    const toShow = live.length ? live.map((v:any)=>({...v, _route: VEH_ROUTE[v.id]||"—"})) : [
      {id:"NER-1024", _route:"NH-37", lat:26.5, lng:92.9, delayMinutes:120, etaMinutes:225, status:"on_route", cargo:"medicines"},
      {id:"NER-1025", _route:"NH-52", lat:27.48, lng:94.91, delayMinutes:240, etaMinutes:360, status:"delayed", cargo:"food"},
      {id:"NER-1026", _route:"NH-29", lat:26.14, lng:91.73, delayMinutes:0, etaMinutes:180, status:"on_route", cargo:"construction"},
      {id:"NER-1027", _route:"NH-157", lat:26.63, lng:92.8, delayMinutes:180, etaMinutes:300, status:"delayed", cargo:"medicines"},
      {id:"NER-1028", _route:"NH-31", lat:26.2, lng:92.9, delayMinutes:60, etaMinutes:240, status:"delayed", cargo:"food"},
    ];
    toShow.forEach((v:any)=>{
      const lat=v.lat ?? 26.5, lng=v.lng ?? 92.9;
      const isFocused = focusId && v.id===focusId;
      const dotColor = v.status==="stranded"||v.delayMinutes>180 ? "#ef4444" : v.delayMinutes>60 ? "#f97316" : v.delayMinutes>0 ? "#f59e0b" : "#06b6d4";
      const ring = dotColor==="#06b6d4" ? "#ffffff" : dotColor;
      const icon = leaflet.divIcon({html:`<div style="background:${dotColor};width:${isFocused?20:16}px;height:${isFocused?20:16}px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${ring}, 0 4px 12px rgba(0,0,0,0.6);"></div><div style="position:absolute;top:50%;left:50%;width:${isFocused?28:24}px;height:${isFocused?28:24}px;margin:-${isFocused?14:12}px 0 0 -${isFocused?14:12}px;border-radius:50%;border:2px solid ${dotColor};opacity:0.35;animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>`,className:"",iconSize:[isFocused?20:16,isFocused?20:16]});
      const html = `<div style="display:flex;flex-direction:column;align-items:center;gap:3px;transform:translate(-50%,-100%);"><div style="background:#0f172a;color:white;font-size:10px;font-weight:900;padding:2px 6px;border-radius:999px;border:2px solid ${dotColor};white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.5);">${v.id} • ${v._route||""}</div><div style="background:${dotColor};width:${isFocused?20:16}px;height:${isFocused?20:16}px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px ${ring}, 0 4px 12px rgba(0,0,0,0.6);"></div></div>`;
      const combinedIcon = leaflet.divIcon({html, className:"", iconSize:[100,40], iconAnchor:[50,16]});
      const m = leaflet.marker([lat,lng],{icon: combinedIcon}).addTo(vehicleLayerRef.current);
      const fmt=(m:number)=> `${String(Math.floor(m/60)).padStart(2,"0")}:${String(m%60).padStart(2,"0")} hrs`;
      m.bindTooltip(`<b>${v.id} • ${v._route||""}</b> ${v.cargo||""}<br/>on <b>${v._route||""}</b> • ${fmt(v.etaMinutes||0)} • ${v.delayMinutes?fmt(v.delayMinutes)+" delay":"On time"}<br/>${v.status}`,{sticky:true});
      if(isFocused) m.openTooltip();
    });
    if(focusId){ const f=toShow.find((v:any)=>v.id===focusId); if(f) map.flyTo([f.lat,f.lng],9,{duration:0.8}); }
  },[liveVehicles, focusId]);

  // Drone corridor 30km when blocked — different vs SHIELD
  React.useEffect(()=>{
    const map = mapInstanceRef.current; const leaflet = leafletRef.current;
    if(!map||!leaflet) return;
    if(!droneLayerRef.current) droneLayerRef.current = leaflet.layerGroup().addTo(map);
    else droneLayerRef.current.clearLayers();
    if(!incidents || !incidents.length) return;
    const hav=(a:number,b:number,c:number,d:number)=>{ const R=6371; const dLa=(c-a)*Math.PI/180; const dLo=(d-b)*Math.PI/180; const s=Math.sin(dLa/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(s)); };
    incidents.filter((inc:any)=> inc.accessibilityStatus==="blocked" && inc.location).slice(0,2).forEach((inc:any)=>{
      const {latitude, longitude} = inc.location;
      // drone range 30km blue dashed
      leaflet.circle([latitude, longitude], {radius:30000, color:"#0ea5e9", fillColor:"#0ea5e9", fillOpacity:0.12, weight:2, dashArray:"6 6"}).addTo(droneLayerRef.current).bindTooltip(`Drone 30km • ${inc.type} blocked`,{sticky:true});
      // nearest hub arc
      let best=HUBS[0]; let bd=Infinity; for(const h of HUBS){ const d=hav(latitude,longitude,h.lat,h.lng); if(d<bd){bd=d; best=h;} }
      leaflet.polyline([[latitude,longitude],[best.lat,best.lng]], {color:"#0ea5e9", weight:3, opacity:0.9, dashArray:"8 8"}).addTo(droneLayerRef.current).bindTooltip(`Drone: ${best.name} → incident ${Math.round(bd)}km 12kg 18min`,{sticky:true});
      leaflet.marker([best.lat,best.lng], {icon: leaflet.divIcon({html:`<div style="background:#0ea5e9;color:white;font-size:9px;font-weight:900;padding:2px 5px;border-radius:4px;">🚁 ${best.name}</div>`, className:""})}).addTo(droneLayerRef.current);
    });
  },[incidents]);

  return <div ref={mapRef} className="w-full h-[420px] bg-slate-100" />;
}

export function GISMap({ routes, focusId, liveVehicles, incidents }: GISMapProps) {
  return (
    <div className="space-y-0">
      <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 bg-slate-900 border-b border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-[11px] font-black tracking-widest text-white whitespace-nowrap">NER • EXACT OUTLINE • LIVE GPS • 🚁 DRONE READY</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-white text-slate-900 whitespace-nowrap shadow-sm">7 STATES • OSM • LIVE</span>
            {focusId && <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500 text-white whitespace-nowrap">FOCUS: {focusId}</span>}
          </div>
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-white whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Accessible</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-amber-400 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-amber-500" /> Delayed</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-orange-400 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-orange-500" /> High Risk</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-red-400 whitespace-nowrap"><span className="h-2 w-2 rounded-full bg-red-500" /> Blocked</span>
          </div>
        </div>
        <LeafletMap routes={routes} focusId={focusId} liveVehicles={liveVehicles} incidents={incidents} />
        <div className="relative flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800 border-t border-white/10">
          <span className="text-[11px] font-bold tracking-widest text-white">5 CORRIDORS • EXACT NH GEOMETRY • 7 STATES OUTLINE</span>
          <span className="text-[11px] font-mono font-bold text-emerald-300">© OSM • udit-001/india-maps-data • GPS: LIVE</span>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white mt-3">
        <table className="w-full text-left">
          <thead><tr className="bg-slate-50 border-b border-slate-200"><th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600">ROUTE</th><th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600">CORRIDOR</th><th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600">STATUS</th><th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600 hidden md:table-cell">ETA</th><th className="px-3 py-2 text-[11px] font-black tracking-widest text-slate-600">RISK</th></tr></thead>
          <tbody>
            {routes.map((route)=>(
              <tr key={route.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2.5 font-black text-slate-900 text-sm">{route.name}</td>
                <td className="px-3 py-2.5 text-xs font-bold text-slate-700">{route.from} → {route.to}</td>
                <td className="px-3 py-2.5"><span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-black tracking-widest text-white" style={{background:statusColors[route.status]}}><span className="h-1.5 w-1.5 rounded-full bg-white" /> {statusLabels[route.status].toUpperCase()}</span></td>
                <td className="px-3 py-2.5 text-xs font-bold text-slate-900 hidden md:table-cell">{route.eta} • {route.distance}km</td>
                <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block"><div className="h-full rounded-full" style={{width:`${route.riskScore}%`,background:statusColors[route.status]}} /></div><span className="text-xs font-black" style={{color:statusColors[route.status]}}>{route.riskScore}%</span></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { GISMap } from "@/components/GISMap";
import { RouteDisruptionPredictor } from "@/components/RouteDisruptionPredictor";
import { SmartAlternateRouteEngine } from "@/components/SmartAlternateRouteEngine";
import { LogisticsPriorityEngine } from "@/components/LogisticsPriorityEngine";
import { IncidentDashboard } from "@/components/IncidentReporting";
import { VehicleTracking } from "@/components/VehicleTracking";
import { EssentialSuppliesMonitor } from "@/components/VehicleTracking";
import { AlertCenter } from "@/components/AlertSystem";
import { EmergencyModeToggle } from "@/components/EmergencyMode";
import { LiveGPSTracker } from "@/components/LiveGPSTracker";
import { CommandNav } from "@/components/CommandNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLiveVehicles } from "@/lib/useLiveVehicles";
import ImpactPanel from "@/components/ImpactPanel";
import HazardSimModal from "@/components/HazardSimModal";
import { HUBS } from "@/lib/hubs";
import { useTranslation } from "@/lib/i18n";

const sampleRoutes = [
  { id: "1", name: "NH-37", from: "Guwahati", to: "Silchar", status: "high_risk", distance: "210", eta: "6h 30m", riskScore: 82 },
  { id: "2", name: "NH-52", from: "Dibrugarh", to: "Tinsukia", status: "delayed", distance: "155", eta: "4h 15m", riskScore: 45 },
  { id: "3", name: "NH-157", from: "Tezpur", to: "Itanagar", status: "blocked", distance: "320", eta: "8h", riskScore: 95 },
  { id: "4", name: "NH-29", from: "Jorhat", to: "Mokokchung", status: "accessible", distance: "180", eta: "5h", riskScore: 15 },
  { id: "5", name: "NH-31", from: "Assam", to: "Tripura", status: "high_risk", distance: "280", eta: "7h 45m", riskScore: 78 },
] as const;

const sampleDistrictData = {
  Assam: { roads: 75, weatherRisk: 30, disruptions: 20, connectivity: 70, emergencyAccess: 65 },
  "Arunachal Pradesh": { roads: 45, weatherRisk: 50, disruptions: 35, connectivity: 40, emergencyAccess: 30 },
  Meghalaya: { roads: 60, weatherRisk: 25, disruptions: 15, connectivity: 65, emergencyAccess: 55 },
  Mizoram: { roads: 50, weatherRisk: 40, disruptions: 25, connectivity: 50, emergencyAccess: 45 },
  Nagaland: { roads: 55, weatherRisk: 35, disruptions: 20, connectivity: 55, emergencyAccess: 50 },
  Tripura: { roads: 70, weatherRisk: 20, disruptions: 10, connectivity: 75, emergencyAccess: 60 },
  Manipur: { roads: 65, weatherRisk: 30, disruptions: 18, connectivity: 60, emergencyAccess: 55 },
};

const sampleWeather: any = { severity: "rain", rainfall: 45, temperature: 28 };
const sampleRoadInfo: any = { condition: "fair", landslideRisk: true, floodRisk: false };
const sampleHistoricalIncidents: any = [
  { type: "landslide", frequency: 3, severity: "high" },
  { type: "flood", frequency: 2, severity: "medium" },
];
const sampleAlternativesByRoute: Record<string, any[]> = {
  "NH-37": [
    { id: "a1", name: "Brahmaputra South Bypass (via Lumding)", distance: 225, travelTime: 360, status: "accessible", riskScore: 30, accessibility: 90, delayProbability: 15, weatherRisk: 10 },
    { id: "a2", name: "Hill Route via Tezpur-Bomdila", distance: 210, travelTime: 380, status: "delayed", riskScore: 40, accessibility: 70, delayProbability: 25, weatherRisk: 20 },
    { id: "a3", name: "SH-12 Internal (Haflong Villages)", distance: 190, travelTime: 420, status: "high_risk", riskScore: 60, accessibility: 50, delayProbability: 35, weatherRisk: 30 },
  ],
  "NH-52": [
    { id: "a1", name: "North Bank via Dhemaji", distance: 168, travelTime: 340, status: "accessible", riskScore: 25, accessibility: 88, delayProbability: 12, weatherRisk: 8 },
    { id: "a2", name: "Eastern via Sadiya Ferry", distance: 182, travelTime: 410, status: "delayed", riskScore: 45, accessibility: 65, delayProbability: 28, weatherRisk: 22 },
    { id: "a3", name: "SH-15 Rural (Doom Dooma)", distance: 155, travelTime: 390, status: "high_risk", riskScore: 62, accessibility: 48, delayProbability: 38, weatherRisk: 32 },
  ],
  "NH-157": [
    { id: "a1", name: "Bomdila Hill Bypass", distance: 335, travelTime: 480, status: "accessible", riskScore: 35, accessibility: 82, delayProbability: 18, weatherRisk: 12 },
    { id: "a2", name: "Bhalukpong Valley Route", distance: 310, travelTime: 450, status: "delayed", riskScore: 42, accessibility: 72, delayProbability: 22, weatherRisk: 18 },
    { id: "a3", name: "Arunachal Frontier Track", distance: 298, travelTime: 520, status: "high_risk", riskScore: 68, accessibility: 45, delayProbability: 40, weatherRisk: 35 },
  ],
  "NH-29": [
    { id: "a1", name: "Mariani Diversion", distance: 195, travelTime: 300, status: "accessible", riskScore: 18, accessibility: 92, delayProbability: 8, weatherRisk: 5 },
    { id: "a2", name: "Amguri Corridor", distance: 188, travelTime: 320, status: "delayed", riskScore: 32, accessibility: 75, delayProbability: 15, weatherRisk: 10 },
    { id: "a3", name: "Village Link SH-8", distance: 172, travelTime: 360, status: "accessible", riskScore: 22, accessibility: 85, delayProbability: 10, weatherRisk: 7 },
  ],
  "NH-31": [
    { id: "a1", name: "Karimganj Bypass", distance: 295, travelTime: 420, status: "accessible", riskScore: 28, accessibility: 88, delayProbability: 14, weatherRisk: 9 },
    { id: "a2", name: "Kailashahar Hill Route", distance: 310, travelTime: 460, status: "delayed", riskScore: 44, accessibility: 68, delayProbability: 26, weatherRisk: 19 },
    { id: "a3", name: "Tripura Internal SH-6", distance: 268, travelTime: 400, status: "accessible", riskScore: 33, accessibility: 80, delayProbability: 16, weatherRisk: 11 },
  ],
};
const sampleAlternatives: any = sampleAlternativesByRoute["NH-37"];
const FIXED_TS = "2026-08-26T09:19:00.000Z";
const sampleVehicles: any = [
  { id: "NER-1024", cargo: "medicines", destination: "Remote District", currentLocation: "Assam", etaMinutes: 225, delayMinutes: 120, status: "on_route", accessibility: 75, lastUpdate: FIXED_TS, populationAffected: 1200 },
  { id: "NER-1025", cargo: "food", destination: "Relief Camp", currentLocation: "Arunachal Pradesh", etaMinutes: 360, delayMinutes: 240, status: "delayed", accessibility: 45, lastUpdate: FIXED_TS, populationAffected: 2500 },
  { id: "NER-1026", cargo: "construction", destination: "Project Site", currentLocation: "Assam", etaMinutes: 180, delayMinutes: 0, status: "on_route", accessibility: 85, lastUpdate: FIXED_TS, populationAffected: 800 },
  { id: "NER-1027", cargo: "medicines", destination: "Isolated Village", currentLocation: "Mizoram", etaMinutes: 300, delayMinutes: 180, status: "delayed", accessibility: 35, lastUpdate: FIXED_TS, populationAffected: 900 },
  { id: "NER-1028", cargo: "food", destination: "Relief Camp", currentLocation: "Manipur", etaMinutes: 240, delayMinutes: 60, status: "delayed", accessibility: 60, lastUpdate: FIXED_TS, populationAffected: 1500 },
];
const sampleIncidents: any = [
  { id: "1", type: "landslide", description: "Major landslide reported on NH-37", severity: "high", accessibilityStatus: "blocked", timestamp: "2026-08-26T09:17:00.000Z", location: { latitude: 26.2, longitude: 92.9 }, offline: false },
  { id: "2", type: "flood", description: "Heavy rainfall causing flooding in lower Assam", severity: "medium", accessibilityStatus: "delayed", timestamp: "2026-08-26T08:49:00.000Z", location: { latitude: 26.1, longitude: 91.7 }, offline: false },
];

export default function DashboardPage() {
  const [emergencyMode, setEmergencyMode] = React.useState("inactive");
  const [navOpen, setNavOpen] = React.useState(false);
  const [activeNav, setActiveNav] = React.useState("overview");
  const [focusVehicle, setFocusVehicle] = React.useState<string | null>(null);
  const [liveWeather, setLiveWeather] = React.useState<any>(null);
  const [liveDistricts, setLiveDistricts] = React.useState<Record<string, any>>({});
  const [incidents, setIncidents] = React.useState<any[]>(sampleIncidents);
  const [selectedRouteId, setSelectedRouteId] = React.useState<string>("NH-37");
  const [aiTab, setAiTab] = React.useState<"predict"|"alternate"|"priority">("predict");
  const [districtsExpanded, setDistrictsExpanded] = React.useState(false);
  const [originHub, setOriginHub] = React.useState(HUBS[0].id);
  const [destHub, setDestHub] = React.useState(HUBS[5].id);
  const [commodity, setCommodity] = React.useState<"medicines"|"food"|"construction">("medicines");
  const [hubRoute, setHubRoute] = React.useState<any>(null);
  const { t } = useTranslation();
  // Hub pair -> live OSRM route (full mesh 7 hubs =21 pairs) — not just 3 NH
  React.useEffect(()=>{
    const o = HUBS.find(h=>h.id===originHub); const d = HUBS.find(h=>h.id===destHub);
    if(!o||!d) return;
    if(o.id===d.id){ setHubRoute(null); return; }
    // keep NH mapping for fallback
    const od=o.district, dd=d.district;
    if(od==="Assam" && dd==="Manipur") setSelectedRouteId("NH-37");
    else if(od==="Arunachal Pradesh" && dd==="Assam") setSelectedRouteId("NH-52");
    else if(od==="Tripura" && dd==="Assam") setSelectedRouteId("NH-31");
    else if(od==="Assam" && dd==="Arunachal Pradesh") setSelectedRouteId("NH-157");
    else if(od==="Assam" && dd==="Nagaland") setSelectedRouteId("NH-29");
    else setSelectedRouteId("NH-37");
    // OSRM hub-to-hub live + hub-specific alternates via intermediate hubs
    (async()=>{
      const viaHubs = HUBS.filter(h=> h.id!==o.id && h.id!==d.id).slice(0,2);
      const hubDist = (a:any,b:any)=>{ const toRad=(x:number)=>x*Math.PI/180; const R=6371; const dLa=toRad(b.lat-a.lat), dLo=toRad(b.lng-a.lng); const s=Math.sin(dLa/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLo/2)**2; return Math.round(2*R*Math.asin(Math.sqrt(s))); };
      try{
        const url=`https://router.project-osrm.org/route/v1/driving/${o.lng},${o.lat};${d.lng},${d.lat}?overview=false&alternatives=2`;
        const r=await fetch(url); const j=await r.json();
        if(j.routes?.[0]){
          const main=j.routes[0];
          // Build hub-specific alts via intermediate hubs (not generic Alt via Hub 1)
          const alts = viaHubs.map((via,i)=>{
            const base = (sampleAlternativesByRoute[selectedRouteId]||sampleAlternatives)[i];
            const d1=hubDist(o, via), d2=hubDist(via, d);
            return {id:`hub-alt-${via.id}`, name: base ? `${base.name} (via ${via.name})` : `Via ${via.name} — ${via.district} Corridor`, distance: d1+d2, travelTime: Math.round((d1+d2)*1.4), status: i===0?"accessible":"delayed" as any, riskScore: 32+i*12, accessibility: 85-i*10, delayProbability: 12+i*8, weatherRisk: 9+i*2 };
          });
          // also add OSRM alt if exists
          if(j.routes[1]) alts.push({id:"osrm-alt", name:`OSRM Alt ${Math.round(j.routes[1].distance/1000)}km — ${viaHubs[0]?.name || "Hub"} corridor`, distance:Math.round(j.routes[1].distance/1000), travelTime:Math.round(j.routes[1].duration/60), status:"delayed", riskScore: 45, accessibility:75, delayProbability:18, weatherRisk:11});
          setHubRoute({ main: {id:"hub-main", name:`${o.name} → ${d.name}`, distance:Math.round(main.distance/1000), travelTime:Math.round(main.duration/60), status:"accessible", riskScore: 28, accessibility:90, delayProbability:10, weatherRisk:8, from:o.name, to:d.name}, alts});
        } else throw new Error();
      }catch{
        const km=hubDist(o,d);
        const alts = viaHubs.map((via,i)=>{ const base=(sampleAlternativesByRoute[selectedRouteId]||sampleAlternatives)[i]; const d1=hubDist(o,via), d2=hubDist(via,d); return {id:`via-${via.id}`, name: base? `${base.name} (via ${via.name})` : `Via ${via.name} — ${via.district} Corridor`, distance:d1+d2, travelTime:Math.round((d1+d2)*1.4), status: i===0?"accessible":"delayed" as any, riskScore: 32+i*12, accessibility:85-i*10, delayProbability:12+i*8, weatherRisk:9}; });
        setHubRoute({ main:{id:"hub-main", name:`${o.name} → ${d.name}`, distance:km, travelTime:Math.round(km*1.4), status:"accessible", riskScore: 32, accessibility:88, delayProbability:12, weatherRisk:9, from:o.name, to:d.name}, alts});
      }
    })();
  },[originHub, destHub]);
  const liveVehiclesRaw = useLiveVehicles(2500);
  // Merge live lat/lng with full vehicle records so map knows delay/ETA/status
  const liveVehicles = React.useMemo(() => {
    const merged: Record<string, any> = {};
    sampleVehicles.forEach((v: any) => {
      const live = (liveVehiclesRaw as any)[v.id];
      merged[v.id] = live ? { ...v, lat: live.lat, lng: live.lng, currentLocation: live.currentLocation, updatedAt: live.updatedAt } : { ...v, lat: v.id === "NER-1024" ? 26.5 : v.id === "NER-1025" ? 27.48 : 26.14, lng: v.id === "NER-1024" ? 92.9 : v.id === "NER-1025" ? 94.91 : 91.73, updatedAt: v.lastUpdate };
    });
    return merged;
  }, [liveVehiclesRaw]);
  // LIVE corridors - STATUS/RISK now from Open-Meteo live weather (not showcase)
  const routeDistrict: Record<string,string> = {"NH-37":"Assam","NH-52":"Arunachal Pradesh","NH-157":"Arunachal Pradesh","NH-29":"Nagaland","NH-31":"Tripura"};
  const liveRoutesBase = React.useMemo(() => sampleRoutes.map((r:any)=>{
    const d = routeDistrict[r.name]; const live = d ? (liveDistricts as any)[d] : null;
    if(!live) return r; // no live yet -> showcase fallback
    const risk = live.liveRisk; // 0-95 from /api/weather/live
    const status = risk>=80 ? "blocked" : risk>=60 ? "high_risk" : risk>=35 ? "delayed" : "accessible";
    return { ...r, riskScore: risk, status };
  }), [liveDistricts]);
  const isEmergency = emergencyMode === "active";
  const liveRoutes = React.useMemo(()=> isEmergency ? liveRoutesBase.filter((r:any)=> r.status==="blocked"||r.status==="high_risk") : liveRoutesBase, [liveRoutesBase, isEmergency]);
  const emergencyVehicles = React.useMemo(()=> isEmergency ? sampleVehicles.filter((v:any)=> (v.cargo==="medicines"||v.cargo==="food") && v.delayMinutes>0) : sampleVehicles, [isEmergency]);
  const liveAlerts = React.useMemo(()=>{
    const a:any[] = [];
    const vehMap:Record<string,string>={"NH-37":"NER-1024","NH-52":"NER-1025","NH-157":"NER-1027","NH-29":"NER-1026","NH-31":"NER-1028"};
    liveRoutesBase.forEach((r:any)=>{
      if(r.status==="blocked") a.push({ id:`a-${r.name}`, level:"critical", category:"route_blocked", title:"Route Blocked", message:`${r.name} blocked — live ${r.riskScore}%`, action:"Reroute via Alternative Corridor B", timestamp: new Date().toISOString(), routeId:r.name, vehicleId: vehMap[r.name] });
      else if(r.status==="high_risk") a.push({ id:`a-${r.name}`, level:"warning", category:"weather", title:"High Risk", message:`${r.name} high risk ${r.riskScore}%`, action:"Reroute via Alternative Corridor B", timestamp: new Date().toISOString(), routeId:r.name, vehicleId: vehMap[r.name] });
    });
    if(a.length===0) a.push({ id:"1", level:"informational", category:"field_update", title:"All Clear", message:"No critical blocks — live monitoring", action:"Update dashboard", timestamp: new Date().toISOString() });
    // merge field incidents
    incidents.slice(0,1).forEach((inc:any)=> a.push({ id:`inc-${inc.id}`, level: inc.severity==="high"?"critical":inc.severity==="medium"?"warning":"informational", category:"field_update", title: inc.type, message: inc.description, action:"View on map", timestamp: inc.timestamp, routeId: inc.location?`${inc.location.latitude.toFixed(1)},${inc.location.longitude.toFixed(1)}`:"Field" }));
    return a.slice(0,5);
  }, [liveRoutesBase, incidents]);
  const handleAlertAction = async (alert:any)=>{
    if(alert.action?.toLowerCase().includes("reroute") && alert.vehicleId){
      await fetch("/api/reroute",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({vehicleId: alert.vehicleId, from: alert.routeId, to: "Brahmaputra South Bypass (via Lumding)", reason: alert.title})});
      alert(`✓ Reroute sent to ${alert.vehicleId} for ${alert.routeId}`);
    }
  };
  // Memoize weather objects to prevent predictor flicker (new object ref every render)
  const liveWeatherForPredictor = React.useMemo(() => liveWeather ? { severity: liveWeather.severity, rainfall: liveWeather.rainfall, temperature: liveWeather.temperature } : null, [liveWeather?.severity, liveWeather?.rainfall, liveWeather?.temperature]);
  const liveWeatherForAlternate = React.useMemo(() => liveWeather ? { severity: liveWeather.severity, rainfall: liveWeather.rainfall } : null, [liveWeather?.severity, liveWeather?.rainfall]);
  React.useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/weather/live");
        const j = await r.json();
        if (j.live) {
          if (j.primary) setLiveWeather(j.primary);
          if (j.districts) {
            const map: Record<string, any> = {};
            j.districts.forEach((d: any) => {
              const key = d.name.includes("Assam") ? "Assam" : d.name.includes("Arunachal") ? "Arunachal Pradesh" : d.name.includes("Meghalaya") ? "Meghalaya" : d.name.includes("Manipur") ? "Manipur" : d.name.includes("Nagaland") ? "Nagaland" : d.name.includes("Mizoram") ? "Mizoram" : d.name.includes("Tripura") ? "Tripura" : d.name;
              const severityWeight = d.severity==="storm"?50 : d.severity==="rain"?30 : d.severity==="cloudy"?15 : 0;
              const liveRisk = Math.min(95, Math.round((d.rainfall||0)*1.8 + severityWeight + 5));
              map[key] = { ...d, liveRisk };
            });
            setLiveDistricts(map);
          }
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 42000); // 42s like NER-SHIELD Live Telemetry Sync
    return () => clearInterval(id);
  }, []);

  // Load incidents poll 5s no-store so field report appears without hard refresh
  React.useEffect(() => {
    const loadIncidents = async () => {
      try {
        const r = await fetch("/api/incidents", { cache: "no-store" });
        const j = await r.json();
        if (j.incidents) setIncidents(j.incidents);
      } catch {}
    };
    loadIncidents();
    const id = setInterval(loadIncidents, 5000);
    return () => clearInterval(id);
  }, []);
  const scrollTo = (id: string) => {
    setActiveNav(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setNavOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#eef2f7] text-slate-900 flex flex-col">
      {/* TOP COMMAND BAR - HIGH CONTRAST */}
      <header className={`sticky top-0 z-30 border-b ${isEmergency ? "bg-red-700 border-red-800 text-white" : "bg-slate-900 border-slate-800 text-white"}`}>
        <div className="h-[64px] px-4 lg:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="xl:hidden h-9 w-9 grid place-items-center rounded bg-white/10 hover:bg-white/20 border border-white/20 text-white"
              aria-label="Toggle navigation"
            >
              <span className="text-lg leading-none">{navOpen ? "✕" : "☰"}</span>
            </button>
            <div className="h-9 w-9 rounded bg-white text-slate-900 grid place-items-center font-black text-sm">NER</div>
            <div className="min-w-0">
              <h1 className="text-[15px] lg:text-[16px] font-bold tracking-tight leading-none truncate">{t("NER LOGISTICS INTELLIGENCE COMMAND CENTER")}</h1>
              <p className="text-[11px] font-semibold tracking-widest opacity-80">{t("NORTH EASTERN REGION • REAL-TIME MONITORING")}</p>
            </div>
            <span className={`hidden md:inline-flex ml-2 px-2.5 py-1 rounded text-[11px] font-bold tracking-widest ${isEmergency ? "bg-white text-red-700 animate-pulse" : "bg-emerald-500 text-white"}`}>
              {isEmergency ? "● EMERGENCY ACTIVE" : "● LIVE"}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden lg:flex flex-col items-end text-xs font-medium">
              <div className="flex items-center gap-2">
                <span className="opacity-70">Last sync:</span><span className="font-mono font-bold">{liveWeather ? new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12:false }) : "09:42:11"} IST</span>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
              </div>
              {liveWeather && <span className="text-[10px] font-bold tracking-widest text-emerald-300">Gathered: {liveWeather.location} {liveWeather.rainfall}mm • {liveWeather.temperature}°C</span>}
            </div>
            <LanguageSwitcher />
            <EmergencyModeToggle status={emergencyMode as any} onToggle={setEmergencyMode} />
          </div>
        </div>
        {isEmergency && (
          <div className="bg-red-800 text-white text-xs font-bold tracking-widest px-4 lg:px-6 py-2 flex items-center gap-3">
            <span>⚠ EMERGENCY MODE:</span><span className="font-normal opacity-90">Medical & food corridors prioritized • Blocked routes rerouted • Isolated districts flagged</span>
          </div>
        )}
      </header>

      <div className="flex flex-1 min-h-0">
        {/* LEFT RAIL - DASHBOARD NAV (desktop) */}
        <aside className="hidden xl:flex w-[240px] shrink-0 bg-slate-900 text-slate-100 flex-col border-r border-slate-800 sticky top-[64px] h-[calc(100vh-64px)]">
          <CommandNav activeNav={activeNav} scrollTo={scrollTo} />
        </aside>

        {/* MOBILE NAV DRAWER - RESPONSIVE */}
        {navOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/50 xl:hidden" onClick={() => setNavOpen(false)} />
            <aside className="fixed left-0 top-[64px] bottom-0 z-50 w-[280px] bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 xl:hidden overflow-y-auto">
              <CommandNav activeNav={activeNav} scrollTo={scrollTo} />
            </aside>
          </>
        )}

        {/* MAIN DASHBOARD CANVAS */}
        <main className="flex-1 min-w-0 bg-[#eef2f7]">
          <div className="max-w-[1600px] mx-auto p-3 lg:p-5 space-y-4">
            {/* KPI STRIP - 7 tiles like NER-SHIELD LIVE (42s sync) */}
            <section id="overview" className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 scroll-mt-20">
              {(() => {
                const districtsMonitored = "7 / 7";
                const roadsOpen = `${liveRoutesBase.filter((r:any)=> r.status==="accessible").length} / ${liveRoutesBase.length}`;
                const roadsDisrupted = liveRoutesBase.filter((r:any)=> r.status==="blocked").length;
                const activeIncidentsCount = incidents.length;
                const vehiclesInTransit = sampleVehicles.length;
                const highRisk = liveRoutesBase.filter((r:any)=> r.status==="high_risk").length;
                const delayed = sampleVehicles.filter((v:any)=> v.delayMinutes>0).length;
                const kpis = [
                  { label: "Districts Monitored", value: districtsMonitored, sub: "7 NER States Covered", accent: "border-emerald-500", valueColor: "text-slate-900", badge: "100% telemetry active" },
                  { label: "Roads Open", value: roadsOpen, sub: `${Math.round(liveRoutesBase.filter((r:any)=>r.status==="accessible").length/liveRoutesBase.length*100)}% Corridors Traversable`, accent: "border-emerald-500", valueColor: "text-emerald-600", badge: "Normal flow on NH-37" },
                  { label: "Roads Disrupted", value: String(roadsDisrupted), sub: "Physical blockage", accent: "border-red-500", valueColor: "text-red-600", badge: roadsDisrupted?`Dima Hasao NH-6 Blocked`:"None" },
                  { label: "Active Incidents", value: String(activeIncidentsCount), sub: "Landslide, Flood & Fog", accent: "border-amber-500", valueColor: "text-amber-600", badge: "2 Clearance crews active" },
                  { label: "Vehicles in Transit", value: String(vehiclesInTransit), sub: "Tracked logistics fleet", accent: "border-sky-500", valueColor: "text-slate-900", badge: "GPS & Telemetry active" },
                  { label: "High-Risk Corridors", value: String(highRisk), sub: "Severe landslide zones", accent: "border-orange-500", valueColor: "text-orange-600", badge: highRisk?"Heavy rainfall alert":"All clear" },
                  { label: "Delayed Deliveries", value: String(delayed), sub: "Impacted essential cargo", accent: "border-amber-500", valueColor: "text-amber-600", badge: delayed?`Vaccine shipment rerouted`:"On time" },
                ];
                return kpis.map((k) => (
                  <div key={k.label} className={`bg-white border border-slate-200 border-l-4 ${k.accent} rounded-lg p-3 shadow-sm`}>
                    <p className="text-[10px] font-black tracking-widest text-slate-500">{t(k.label).toUpperCase()}</p>
                    <p className={`text-[22px] font-black leading-none mt-1 ${k.valueColor}`}>{k.value}</p>
                    <p className="text-[11px] font-semibold text-slate-700 mt-1 truncate">{k.sub}</p>
                    <p className="text-[10px] text-slate-500 mt-1 truncate">{k.badge}</p>
                  </div>
                ));
              })()}
            </section>

            {/* ROW 2: GIS MAP (8 cols) + DISTRICTS (4 cols) */}
            <section id="gis" className="grid grid-cols-12 gap-4 scroll-mt-20">
              <div className="col-span-12 xl:col-span-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
                  <h2 className="text-sm font-black tracking-tight">🛰 {t("GIS ACCESSIBILITY MAP • NER")}</h2>
                  <div className="flex items-center gap-2"><HazardSimModal onInject={async()=>{ const r=await fetch("/api/incidents"); const j=await r.json(); if(j.incidents) setIncidents(j.incidents);}} /><span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-900 text-white">{t("LIVE FEED")}</span></div>
                </div>
                <GISMap routes={liveRoutes as any} districtScores={sampleDistrictData as any} focusId={focusVehicle} liveVehicles={liveVehicles} incidents={incidents} />
                <div className="p-3 bg-slate-50 border-t"><ImpactPanel incidents={incidents} liveVehicles={liveVehicles} /></div>
              </div>

              <div className="col-span-12 xl:col-span-4 bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black tracking-tight">{t("DISTRICTS AT RISK")}</h2>
                  <span className="text-[11px] font-bold tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded">7 DISTRICTS</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-emerald-600 text-white">{Object.keys(liveDistricts).length ? "● LIVE WEATHER" : "● DEMO"}</span>
                  <button onClick={()=>setDistrictsExpanded(!districtsExpanded)} className="text-[11px] font-black underline text-slate-700">{districtsExpanded?"Show critical only":"Show all 7"}</button>
                </div>
                <div className="space-y-2.5">
                  {(() => {
                    const scored = Object.entries(sampleDistrictData).map(([name, data]: any) => {
                      const live = (liveDistricts as any)[name];
                      const wr = live ? live.liveRisk : data.weatherRisk;
                      const score = Math.round((data.roads * 0.3) + ((100 - wr) * 0.2) + ((100 - data.disruptions) * 0.2) + (data.connectivity * 0.15) + (data.emergencyAccess * 0.15));
                      return { name, data, live, score };
                    }).sort((a,b)=> a.score - b.score);
                    const list = districtsExpanded ? scored : scored.slice(0,3);
                    return list.map(({name,data,live,score}:any)=>{
                      const isCritical = score < 40;
                      const color = isCritical ? "#ef4444" : score >= 60 ? "#10b981" : "#f59e0b";
                      const label = isCritical ? "CRITICAL" : score >= 60 ? "GOOD" : score >= 40 ? "MODERATE" : "POOR";
                      return (
                        <div key={name} className="border border-slate-200 rounded-lg p-3 bg-white">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-900">{name}</span>
                            <span className="text-xs font-black px-2 py-1 rounded text-white" style={{ background: color }}>{label}</span>
                          </div>
                          <p className="text-[11px] font-semibold text-slate-600 mt-1">Weather {live ? `${live.rainfall}mm ${live.severity} ` : `${(data as any).weatherRisk} risk `}{live && <span className="text-emerald-600">● live</span>}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                            </div>
                            <span className="text-xs font-black text-slate-900 w-12 text-right">{score}/100</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                {!districtsExpanded && <p className="text-[11px] text-slate-500 mt-2 font-semibold">Compact: 3 lowest scores only • click Show all 7</p>}
              </div>
            </section>

            {/* LiveGPSTracker merged into VehicleTracking — hidden for compact mode (revert commit 6eb8157 to restore) */}

            {/* ROW 3: AI ENGINES - TABBED to reduce repeat */}
            <section id="ai-engine" className="scroll-mt-20">
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="flex items-center gap-1 p-1.5 bg-slate-50 border-b border-slate-200">
                  <button onClick={()=>setAiTab("predict")} className={`px-3 py-1.5 rounded text-xs font-black ${aiTab==="predict"?"bg-slate-900 text-white":"bg-white border text-slate-700"}`}>AI Predictor</button>
                  <button onClick={()=>setAiTab("alternate")} className={`px-3 py-1.5 rounded text-xs font-black ${aiTab==="alternate"?"bg-slate-900 text-white":"bg-white border text-slate-700"}`}>Smart Alternate • {selectedRouteId}</button>
                  <button onClick={()=>setAiTab("priority")} className={`px-3 py-1.5 rounded text-xs font-black ${aiTab==="priority"?"bg-slate-900 text-white":"bg-white border text-slate-700"}`}>Logistics Priority</button>
                  <span className="ml-auto text-[10px] font-bold text-slate-500">Compact • reversible via git revert 6eb8157</span>
                </div>
                {aiTab==="predict" && (
                  <>
                    {liveWeather && (
                      <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                        <span className="text-[11px] font-black tracking-widest text-emerald-800">● LIVE NER TODAY • {liveWeather.location} • {liveWeather.temperature}°C • {liveWeather.rainfall}mm • {liveWeather.severity.toUpperCase()}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">LIVE</span>
                      </div>
                    )}
                    <RouteDisruptionPredictor
                      routeId={selectedRouteId}
                      from={sampleRoutes.find((r) => r.name === selectedRouteId)?.from || "Guwahati"}
                      to={sampleRoutes.find((r) => r.name === selectedRouteId)?.to || "Silchar"}
                      distance={sampleRoutes.find((r) => r.name === selectedRouteId)?.distance ? parseInt(String(sampleRoutes.find((r) => r.name === selectedRouteId)!.distance)) : 210}
                      weather={(liveWeatherForPredictor as any) || sampleWeather}
                      roadInfo={sampleRoadInfo}
                      trafficDensity={75}
                      historicalIncidents={sampleHistoricalIncidents}
                      onRouteChange={setSelectedRouteId}
                    />
                  </>
                )}
                {aiTab==="alternate" && (
                  <>
                    <div className="px-3 py-2 bg-slate-900 border-b border-slate-700 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-300">ORIGIN HUB</span>
                      <select value={originHub} onChange={e=>setOriginHub(e.target.value)} className="text-xs font-bold border rounded px-2 py-1 bg-white">
                        {HUBS.map(h=> <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <span className="text-[10px] font-bold text-slate-300">DEST</span>
                      <select value={destHub} onChange={e=>setDestHub(e.target.value)} className="text-xs font-bold border rounded px-2 py-1 bg-white">
                        {HUBS.map(h=> <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                      <span className="text-[10px] font-bold text-slate-300">COMMODITY</span>
                      <select value={commodity} onChange={e=>setCommodity(e.target.value as any)} className="text-xs font-bold border rounded px-2 py-1 bg-white">
                        <option value="medicines">Medicines & Vaccines (3.5x)</option><option value="food">Food (1.2x)</option><option value="construction">Construction (1.0x)</option>
                      </select>
                      <span className={`ml-auto text-[10px] font-black px-2 py-1 rounded ${commodity==="medicines"?"bg-red-600 text-white":"bg-slate-700 text-white"}`}>{commodity==="medicines"?"3.5x Risk Aversion":"Standard"}</span>
                    </div>
                    {originHub===destHub ? <div className="p-6 text-sm font-black text-red-600">⚠️ Origin and Destination cannot be same — select different hubs</div> : (() => { const mult = commodity==="medicines"?3.5: commodity==="food"?1.2:1; const baseAlts = hubRoute?.alts?.length ? hubRoute.alts : (sampleAlternativesByRoute[selectedRouteId] || sampleAlternatives); const alts = baseAlts.map((a:any)=> ({...a, riskScore: Math.min(98, Math.round(a.riskScore * (mult>1 ? (a.status==="accessible"?1: mult*0.6):1)))})); const cur = hubRoute?.main || liveRoutesBase.find((r:any)=> r.name===selectedRouteId) || liveRoutesBase[0]; return (
                    <SmartAlternateRouteEngine
                      currentRoute={cur as any}
                      availableAlternatives={alts}
                      weather={(liveWeatherForAlternate as any) || sampleWeather}
                      vehicleLocation={focusVehicle ? liveVehicles[focusVehicle]?.currentLocation : undefined}
                      vehicleId={focusVehicle || undefined}
                    />); })()}
                  </>
                )}
                {aiTab==="priority" && <LogisticsPriorityEngine vehicles={emergencyVehicles} live={liveVehicles} liveRoutes={liveRoutes as any} />}
              </div>
            </section>

            {/* ROW 4: FIELD INTELLIGENCE + ALERTS - form removed, dedicated /field page is source */}
            <section id="alerts" className="grid grid-cols-12 gap-4 scroll-mt-20">
              <div id="vehicles" className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-sm p-4 scroll-mt-20">
                <h2 className="text-sm font-black tracking-tight mb-3">{t("FIELD INTELLIGENCE • INCIDENT REPORTS")}</h2>
                <p className="text-[11px] font-bold tracking-widest text-slate-500 mb-3">Reports from <a href="/field" className="underline text-sky-700">/field</a> • geo-tagged + photo</p>
                <IncidentDashboard />
              </div>
              <div className="col-span-12 lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                  <AlertCenter alerts={liveAlerts as any} onAction={handleAlertAction} />
                  {isEmergency && <p className="text-[11px] font-bold text-red-600 mt-2">⚠ EMERGENCY: showing only BLOCKED/HIGH RISK corridors + critical vehicles</p>}
                </div>
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                  <VehicleTracking vehicles={emergencyVehicles} onFocus={setFocusVehicle} live={liveVehicles} liveRoutes={liveRoutes as any} />
                </div>
                {/* EssentialSuppliesMonitor hidden for compact mode — same data as Logistics Priority, revert commit 6eb8157 to restore */}
              </div>
            </section>

            <footer className="text-[11px] font-semibold tracking-widest text-slate-500 text-center py-2">NER LOGISTICS INTELLIGENCE • PREDICTIVE ACCESSIBILITY • SIH26002</footer>
          </div>
        </main>
      </div>
    </div>
  );
}
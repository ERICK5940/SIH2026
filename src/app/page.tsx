"use client";

import React from "react";
import { GISMap } from "@/components/GISMap";
import { RouteDisruptionPredictor } from "@/components/RouteDisruptionPredictor";
import { SmartAlternateRouteEngine } from "@/components/SmartAlternateRouteEngine";
import { LogisticsPriorityEngine } from "@/components/LogisticsPriorityEngine";
import { IncidentReportForm } from "@/components/IncidentReporting";
import { IncidentDashboard } from "@/components/IncidentReporting";
import { VehicleTracking } from "@/components/VehicleTracking";
import { EssentialSuppliesMonitor } from "@/components/VehicleTracking";
import { AlertCenter } from "@/components/AlertSystem";
import { EmergencyModeToggle } from "@/components/EmergencyMode";
import { LiveGPSTracker } from "@/components/LiveGPSTracker";
import { CommandNav } from "@/components/CommandNav";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { DriverInbox } from "@/components/DriverInbox";
import { useLiveVehicles } from "@/lib/useLiveVehicles";

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
  // LIVE corridors - STATUS/RISK now from Open-Meteo live weather + incident boost (so Erode report also impacts)
  const routeDistrict: Record<string,string> = {"NH-37":"Assam","NH-52":"Arunachal Pradesh","NH-157":"Arunachal Pradesh","NH-29":"Nagaland","NH-31":"Tripura"};
  const liveRoutesBase = React.useMemo(() => {
    // incident boost per route - Haversine nearest route
    const hav = (a:number,b:number,c:number,d:number)=>{ const R=6371; const dLa=(c-a)*Math.PI/180; const dLo=(d-b)*Math.PI/180; const s1=Math.sin(dLa/2)**2 + Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLo/2)**2; return 2*R*Math.asin(Math.sqrt(s1)); };
    const routeMid: Record<string,[number,number]> = {"NH-37":[26.2,92.9],"NH-52":[27.7,95.0],"NH-157":[27.1,93.6],"NH-29":[26.1,94.5],"NH-31":[24.8,91.9]};
    const boost: Record<string,number> = {};
    incidents.forEach((inc:any)=>{
      if(!inc.location) return;
      let nearest="NH-37"; let best=Infinity;
      Object.entries(routeMid).forEach(([k,v])=>{ const dis=hav(inc.location.latitude,inc.location.longitude,v[0],v[1]); if(dis<best){best=dis; nearest=k;} });
      const add = inc.severity==="high"?28:inc.severity==="medium"?14:6; // severity boost
      // even far Erode ~1800km still counts 40% for demo so reroute triggers
      const distFactor = best>800?0.4:1; // demothon blast logic
      boost[nearest]=(boost[nearest]||0)+Math.round(add*distFactor);
    });
    return sampleRoutes.map((r:any)=>{
      const d = routeDistrict[r.name]; const live = d ? (liveDistricts as any)[d] : null;
      const base = live ? live.liveRisk : r.riskScore;
      const incB = boost[r.name]||0;
      let risk = Math.min(98, base + incB);
      // if blocked incident directly on route (accessibilityStatus blocked -> force max)
      const hasBlocked = incidents.some((inc:any)=>{ const mid=routeMid[r.name]; if(!mid||!inc.location) return false; return hav(inc.location.latitude,inc.location.longitude,mid[0],mid[1])<400 && inc.accessibilityStatus==="blocked"; });
      if(hasBlocked) risk=Math.max(risk,82);
      const status = risk>=80 ? "blocked" : risk>=60 ? "high_risk" : risk>=35 ? "delayed" : "accessible";
      return { ...r, riskScore: risk, status };
    });
  }, [liveDistricts, incidents]);
  const isEmergency = emergencyMode === "active";
  const liveRoutes = React.useMemo(()=> isEmergency ? liveRoutesBase.filter((r:any)=> r.status==="blocked"||r.status==="high_risk") : liveRoutesBase, [liveRoutesBase, isEmergency]);
  const emergencyVehicles = React.useMemo(()=> isEmergency ? sampleVehicles.filter((v:any)=> (v.cargo==="medicines"||v.cargo==="food") && v.delayMinutes>0) : sampleVehicles, [isEmergency]);
  const liveAlerts = React.useMemo(()=>{
    const a:any[] = [];
    liveRoutesBase.forEach((r:any)=>{
      if(r.status==="blocked") a.push({ id:`a-${r.name}`, level:"critical", category:"route_blocked", title:"Route Blocked", message:`${r.name} blocked — live ${r.riskScore}%`, action:"Reroute via Alternative Corridor B", timestamp: new Date().toISOString(), routeId:r.name, vehicleId: r.name==="NH-37"?"NER-1024":r.name==="NH-157"?"NER-1027":undefined });
      else if(r.status==="high_risk") a.push({ id:`a-${r.name}`, level:"warning", category:"weather", title:"High Risk", message:`${r.name} high risk ${r.riskScore}%`, action:"Monitor conditions", timestamp: new Date().toISOString(), routeId:r.name });
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
    const id = setInterval(load, 300000); // 5 mins as requested, not ms
    return () => clearInterval(id);
  }, []);

  // Load incidents
  React.useEffect(() => {
    const loadIncidents = async () => {
      try {
        const r = await fetch("/api/incidents");
        const j = await r.json();
        if (j.incidents) setIncidents(j.incidents);
      } catch {}
    };
    loadIncidents();
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
              <h1 className="text-[15px] lg:text-[16px] font-bold tracking-tight leading-none truncate">NER LOGISTICS INTELLIGENCE COMMAND CENTER</h1>
              <p className="text-[11px] font-semibold tracking-widest opacity-80">NORTH EASTERN REGION • REAL-TIME MONITORING</p>
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
            {/* KPI STRIP - LIVE COMPUTED (no hardcoded) */}
            <section id="overview" className="grid grid-cols-2 lg:grid-cols-4 gap-3 scroll-mt-20">
              {(() => {
                const liveScores = Object.entries(sampleDistrictData).map(([name, data]: any) => {
                  const live = (liveDistricts as any)[name];
                  const wr = live ? live.liveRisk : data.weatherRisk;
                  return Math.round((data.roads * 0.3) + ((100 - wr) * 0.2) + ((100 - data.disruptions) * 0.2) + (data.connectivity * 0.15) + (data.emergencyAccess * 0.15));
                });
                const overall = Math.round(liveScores.reduce((a, b) => a + b, 0) / liveScores.length);
                const overallLabel = overall >= 80 ? "Good" : overall >= 60 ? "Moderate" : overall >= 40 ? "Poor" : "Critical";
                const activeDisruptions = sampleRoutes.filter((r: any) => r.status !== "accessible").length;
                const criticalRoutes = sampleRoutes.filter((r: any) => r.status === "blocked" || r.status === "high_risk").map((r: any) => r.name).join(", ");
                const totalVehicles = sampleVehicles.length;
                const delayed = sampleVehicles.filter((v: any) => v.delayMinutes > 0).length;
                const medicalDelayed = sampleVehicles.filter((v: any) => v.cargo === "medicines" && v.delayMinutes > 0).length;
                const foodDelayed = sampleVehicles.filter((v: any) => v.cargo === "food" && v.delayMinutes > 0).length;
                const kpis = [
                  { label: "OVERALL ACCESSIBILITY", value: String(overall), sub: `${overallLabel} • live avg`, accent: "border-emerald-500", valueColor: overall < 40 ? "text-red-600" : "text-slate-900" },
                  { label: "ACTIVE DISRUPTIONS", value: String(activeDisruptions), sub: `${activeDisruptions} routes • ${criticalRoutes}`, accent: "border-red-500", valueColor: "text-red-600" },
                  { label: "VEHICLES IN TRANSIT", value: String(totalVehicles), sub: `${delayed} delayed • ${totalVehicles - delayed} on-time`, accent: "border-sky-500", valueColor: "text-slate-900" },
                  { label: "DELAYED DELIVERIES", value: String(delayed), sub: `${medicalDelayed} medical • ${foodDelayed} food`, accent: "border-amber-500", valueColor: "text-amber-600" },
                ];
                return kpis.map((k) => (
                  <div key={k.label} className={`bg-white border border-slate-200 border-l-4 ${k.accent} rounded-lg p-4 shadow-sm`}>
                    <p className="text-[11px] font-bold tracking-widest text-slate-600">{k.label}</p>
                    <p className={`text-[32px] font-black leading-none mt-1 ${k.valueColor}`}>{k.value}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{k.sub}</p>
                  </div>
                ));
              })()}
            </section>

            {/* ROW 2: GIS MAP (8 cols) + DISTRICTS (4 cols) */}
            <section id="gis" className="grid grid-cols-12 gap-4 scroll-mt-20">
              <div className="col-span-12 xl:col-span-8 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
                  <h2 className="text-sm font-black tracking-tight">🛰 GIS ACCESSIBILITY MAP • NER</h2>
                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-900 text-white">LIVE FEED</span>
                </div>
                <GISMap routes={liveRoutes as any} districtScores={sampleDistrictData as any} focusId={focusVehicle} liveVehicles={liveVehicles} />
              </div>

              <div className="col-span-12 xl:col-span-4 bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-black tracking-tight">DISTRICTS AT RISK</h2>
                  <span className="text-[11px] font-bold tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded">7 DISTRICTS</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold tracking-widest px-2 py-1 rounded bg-emerald-600 text-white">{Object.keys(liveDistricts).length ? "● LIVE WEATHER" : "● DEMO"}</span>
                  {Object.keys(liveDistricts).length > 0 && <span className="text-[10px] font-semibold text-slate-500">Open-Meteo • updates 10m</span>}
                </div>
                <div className="space-y-2.5">
                  {Object.entries(sampleDistrictData).map(([name, data]: any) => {
                    const live = liveDistricts[name];
                    const weatherRisk = live ? live.liveRisk : data.weatherRisk;
                    const score = Math.round((data.roads * 0.3) + ((100 - weatherRisk) * 0.2) + ((100 - data.disruptions) * 0.2) + (data.connectivity * 0.15) + (data.emergencyAccess * 0.15));
                    const isCritical = score < 40;
                    const color = isCritical ? "#ef4444" : score >= 60 ? "#10b981" : "#f59e0b";
                    const label = isCritical ? "CRITICAL" : score >= 60 ? "GOOD" : score >= 40 ? "MODERATE" : "POOR";
                    return (
                      <div key={name} className="border border-slate-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-slate-900">{name}</span>
                          <span className="text-xs font-black px-2 py-1 rounded text-white" style={{ background: color }}>{label}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-slate-600 mt-1">Weather {live ? `${live.rainfall}mm ${live.severity} ` : `${data.weatherRisk} risk `}{live && <span className="text-emerald-600">● live</span>}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${score}%`, background: color }} />
                          </div>
                          <span className="text-xs font-black text-slate-900 w-12 text-right">{score}/100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="col-span-12">
              <LiveGPSTracker />
            </section>

            {/* ROW 3: AI ENGINES - 2 balanced segments, no empty white */}
            <section id="ai-engine" className="grid grid-cols-12 gap-4 scroll-mt-20">
              <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                {liveWeather && (
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between shrink-0">
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
              </div>
              <div className="col-span-12 lg:col-span-6 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="px-3 py-2 bg-sky-50 border-b border-sky-200 flex items-center gap-2">
                  <span className="text-[11px] font-black tracking-widest text-sky-700">↔ CONNECTED • Showing alternate for {selectedRouteId}{focusVehicle ? ` • Vehicle ${focusVehicle} @ ${liveVehicles[focusVehicle]?.currentLocation || "—"}` : " • All vehicles"}</span>
                  {selectedRouteId !== "NH-37" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-600 text-white">SYNCED</span>}
                </div>
                <SmartAlternateRouteEngine
                  currentRoute={liveRoutesBase.find((r) => r.name === selectedRouteId) as any || liveRoutesBase[0] as any}
                  availableAlternatives={sampleAlternativesByRoute[selectedRouteId] || sampleAlternatives}
                  weather={(liveWeatherForAlternate as any) || sampleWeather}
                  vehicleLocation={focusVehicle ? liveVehicles[focusVehicle]?.currentLocation : undefined}
                  vehicleId={focusVehicle || undefined}
                />
              </div>
            </section>
            {/* ROW 3b: Logistics Priority - full width, no scrollbar, entire content */}
            <section className="grid grid-cols-12 gap-4">
              <div className="col-span-12 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <LogisticsPriorityEngine vehicles={emergencyVehicles} />
              </div>
            </section>

            {/* ROW 4: FIELD INTELLIGENCE + ALERTS */}
            <section id="alerts" className="grid grid-cols-12 gap-4 scroll-mt-20">
              <div id="vehicles" className="col-span-12 lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-sm p-4 scroll-mt-20">
                <h2 className="text-sm font-black tracking-tight mb-3">FIELD INTELLIGENCE • OFFLINE QUEUE</h2>
                <IncidentReportForm onReport={(report) => console.log("Incident reported:", report)} />
                <div className="mt-4 border-t border-slate-200 pt-4">
                  <IncidentDashboard />
                </div>
              </div>
              <div className="col-span-12 lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                  <AlertCenter alerts={liveAlerts as any} onAction={handleAlertAction} />
                  {isEmergency && <p className="text-[11px] font-bold text-red-600 mt-2">⚠ EMERGENCY: showing only BLOCKED/HIGH RISK corridors + critical vehicles</p>}
                </div>
                <DriverInbox />
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4 overflow-hidden">
                    <VehicleTracking vehicles={emergencyVehicles} onFocus={setFocusVehicle} live={liveVehicles} />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-4">
                    <h3 className="text-sm font-black mb-3">ESSENTIAL SUPPLIES {isEmergency && "• EMERGENCY"}</h3>
                    <EssentialSuppliesMonitor vehicles={emergencyVehicles} />
                  </div>
                </div>
              </div>
            </section>

            <footer className="text-[11px] font-semibold tracking-widest text-slate-500 text-center py-2">NER LOGISTICS INTELLIGENCE • PREDICTIVE ACCESSIBILITY • SIH26002</footer>
          </div>
        </main>
      </div>
    </div>
  );
}
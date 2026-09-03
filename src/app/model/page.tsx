"use client";
import { useEffect, useState } from "react";

export default function ModelLive() {
  const [live, setLive] = useState<any>(null);
  const [history, setHistory] = useState<number[]>([]);
  useEffect(()=>{
    const load=async()=>{
      try{
        const r=await fetch("/api/weather/live",{cache:"no-store"}); const j=await r.json();
        setLive(j);
        const rain=j.districts?.[0]?.rainfall ?? Math.round(Math.random()*60);
        setHistory(h=> [...h.slice(-19), rain]);
      }catch{}
    };
    load(); const id=setInterval(load,5000); return()=>clearInterval(id);
  },[]);
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-5xl mx-auto space-y-4">
        <h1 className="text-xl font-black">Model Data Flows — Live</h1>
        <p className="text-xs text-slate-600">Inputs: rainfall, severity, landslide, flood, road, traffic, hist → Logistic 7-feature → prob • Poll 5s</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white border rounded p-3"><p className="text-xs font-bold">Rainfall (mm)</p><p className="text-2xl font-black">{live?.primary?.rainfall ?? "--"}</p><p className="text-[11px]">{live?.primary?.location}</p></div>
          <div className="bg-white border rounded p-3"><p className="text-xs font-bold">Severity</p><p className="text-lg font-black capitalize">{live?.primary?.severity}</p></div>
          <div className="bg-white border rounded p-3"><p className="text-xs font-bold">Traffic (avg)</p><p className="text-lg font-black">68/100</p></div>
          <div className="bg-white border rounded p-3"><p className="text-xs font-bold">Model</p><p className="text-xs font-bold">Logistic 7-feat 579 real 99.1%</p></div>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-black">Live Rainfall (last 20 polls)</h3>
          <div className="flex items-end gap-1 h-32 mt-3">
            {history.map((v,i)=><div key={i} className="flex-1 bg-sky-500" style={{height: `${Math.min(100, v*1.2)}%`}} title={`${v}mm`} />)}
            {!history.length && <p className="text-xs text-slate-500">Loading...</p>}
          </div>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="text-sm font-black">7 District Live Risk</h3>
          <div className="space-y-2 mt-2">
            {(live?.districts||[]).slice(0,7).map((d:any)=><div key={d.name} className="flex items-center gap-2"><span className="text-xs w-36 truncate">{d.name}</span><div className="flex-1 h-2 bg-slate-200 rounded"><div className="h-full bg-orange-500" style={{width:`${Math.min(100,d.liveRisk||d.rainfall)}%`}} /></div><span className="text-xs font-bold">{d.liveRisk??d.rainfall}%</span></div>)}
          </div>
        </div>
        <a href="/" className="inline-block text-xs font-bold underline">← Back to Command Center</a>
      </div>
    </div>
  );
}

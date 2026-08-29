"use client";

import React from "react";

export function CommandNav({
  activeNav,
  scrollTo,
}: {
  activeNav: string;
  scrollTo: (id: string) => void;
}) {
  return (
    <>
      <div className="p-4 space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-widest text-slate-400">COMMAND</p>
          <button onClick={() => scrollTo("overview")} className={`w-full text-left rounded px-3 py-2.5 text-sm font-bold flex items-center gap-2 ${activeNav==="overview"?"bg-white text-slate-900":"text-slate-300 hover:bg-slate-800"}`}>◧ Overview</button>
          <button onClick={() => scrollTo("gis")} className={`w-full text-left rounded px-3 py-2 text-sm font-medium flex items-center gap-2 ${activeNav==="gis"?"bg-white text-slate-900 font-bold":"text-slate-300 hover:bg-slate-800"}`}>⬡ GIS Map & Routes</button>
          <button onClick={() => scrollTo("ai-engine")} className={`w-full text-left rounded px-3 py-2 text-sm font-medium flex items-center gap-2 ${activeNav==="ai-engine"?"bg-white text-slate-900 font-bold":"text-slate-300 hover:bg-slate-800"}`}>◈ AI Risk Engine</button>
          <button onClick={() => scrollTo("vehicles")} className={`w-full text-left rounded px-3 py-2 text-sm font-medium flex items-center gap-2 ${activeNav==="vehicles"?"bg-white text-slate-900 font-bold":"text-slate-300 hover:bg-slate-800"}`}>⬣ Vehicles & Supplies</button>
          <button onClick={() => scrollTo("alerts")} className={`w-full text-left rounded px-3 py-2 text-sm font-medium flex items-center gap-2 ${activeNav==="alerts"?"bg-white text-slate-900 font-bold":"text-slate-300 hover:bg-slate-800"}`}>⚑ Alerts & Incidents</button>
        </div>
        <div className="border-t border-slate-700 pt-4 space-y-2">
          <p className="text-[11px] font-bold tracking-widest text-slate-400">SYSTEM HEALTH</p>
          <div className="bg-slate-800 rounded p-3">
            <div className="flex justify-between text-xs font-bold"><span>Uptime</span><span className="text-emerald-400">99.8%</span></div>
            <div className="flex justify-between text-xs font-bold mt-1"><span>Stations Online</span><span>47/52</span></div>
            <div className="flex justify-between text-xs font-bold mt-1"><span>GPS Feed</span><span className="text-emerald-400">● LIVE</span></div>
          </div>
        </div>
        <div className="bg-amber-500 text-slate-900 rounded p-3">
          <p className="text-xs font-black">DEMO TIP</p>
          <p className="text-xs font-medium leading-snug mt-1">Toggle <b>Emergency Mode</b> in header to show prioritized rerouting — best SIH demo moment.</p>
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-slate-700 text-[11px] font-medium text-slate-400">SIH26002 • Predictive Accessibility Intelligence</div>
    </>
  );
}

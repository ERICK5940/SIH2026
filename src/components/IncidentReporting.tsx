"use client";
import React from "react";

function getSeverityColor(s:"low"|"medium"|"high"){ return s==="high"?"#ef4444":s==="medium"?"#f59e0b":"#10b981"; }
function getSeverityLabel(s:"low"|"medium"|"high"){ return s==="high"?"High":s==="medium"?"Medium":"Low"; }
function getStatusLabel(st:"accessible"|"delayed"|"high_risk"|"blocked"){ return st==="blocked"?"🔴 Blocked":st==="high_risk"?"🟠 High Risk":st==="delayed"?"🟡 Delayed":"🟢 Accessible"; }
function getStatusColor(st:"accessible"|"delayed"|"high_risk"|"blocked"){ return st==="blocked"?"#ef4444":st==="high_risk"?"#f97316":st==="delayed"?"#f59e0b":"#10b981"; }

export function IncidentDashboard({ incidents: propIncidents }: { incidents?: any[] } = {}){
  const [inner,setInner]=React.useState<any[]>([]);
  React.useEffect(()=>{
    if(propIncidents) return;
    let alive=true;
    const load=async()=>{
      try{
        const r=await fetch("/api/incidents",{cache:"no-store"});
        const j=await r.json();
        if(alive && j.incidents) setInner(j.incidents);
      }catch{}
    };
    load();
    const id=setInterval(load,5000);
    return()=>{ alive=false; clearInterval(id); };
  },[propIncidents]);
  const incidents = propIncidents ?? inner;
  if(!incidents.length) return <div><h2 className="text-xl font-semibold mb-6">Incident Reports</h2><p className="text-zinc-500 text-sm">No incidents reported yet.</p></div>;
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Incident Reports</h2>
      <div className="space-y-4">
        {incidents.map((inc:any)=>(
          <div key={inc.id} className="p-4 rounded-lg border-l-4 bg-white border border-slate-200" style={{borderLeftColor:getStatusColor(inc.accessibilityStatus)}}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-zinc-500 text-sm" suppressHydrationWarning>{new Date(inc.timestamp).toLocaleString("en-IN",{timeZone:"Asia/Kolkata",hour12:false})}</p>
                <p className="font-medium mt-1 text-sm">{getStatusLabel(inc.accessibilityStatus)} - {getSeverityLabel(inc.severity)}</p>
                <p className="text-zinc-600 text-xs mt-1 break-words">{inc.description}</p>
                {(inc.state||inc.district||inc.road) && <p className="text-[10px] text-zinc-400 mt-1 font-mono">Road: {inc.road||"—"} • {inc.state||""} / {inc.district||""}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px] font-bold">
                  {["reported","verified","assigned","response","resolved"].map((st,i)=>{
                    const cur=inc.lifecycle||"reported"; const idx=["reported","verified","assigned","response","resolved"].indexOf(cur); const done=i<=idx;
                    return <span key={st} className={`px-1.5 py-0.5 rounded ${done?"bg-slate-900 text-white":"bg-slate-100 text-slate-500"}`}>{st}</span>;
                  })}
                </div>
                {(()=>{
                  const trust=(inc.photoUrl?20:0)+(inc.state?10:0)+(inc.district?10:0)+(inc.description?.length>20?15:0)+(inc.authority?15:0)+30;
                  const pct=Math.min(98,trust); const col=pct>=80?"bg-emerald-100 text-emerald-700 border-emerald-200":pct>=60?"bg-amber-100 text-amber-700 border-amber-200":"bg-red-100 text-red-700 border-red-200";
                  return <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-black border ${col}`}>Trust {pct}% {inc.authority?`• ${inc.authority}`:"• citizen"}</span>;
                })()}
                {(()=>{
                  const order=["reported","verified","assigned","response","resolved"]; const cur=inc.lifecycle||"reported"; const idx=order.indexOf(cur); const next=order[idx+1];
                  if(!next) return <div className="mt-2 flex gap-2"><span className="text-[11px] font-black text-emerald-600 py-1">✓ Resolved</span><button onClick={async()=>{ if(!confirm("Archive to dataset & delete from reports?")) return; await fetch(`/api/incidents?id=${inc.id}`,{method:"DELETE"}); }} className="px-2 py-1 rounded bg-slate-900 text-white text-[11px] font-black">Archive & Delete</button></div>;
                  return <button onClick={async()=>{ await fetch("/api/incidents",{method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id:inc.id, lifecycle:next})}); }} className="mt-2 block px-2 py-1 rounded bg-sky-600 text-white text-[11px] font-black">→ {next}</button>;
                })()}
              </div>
              <div className="w-16 h-16 rounded bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
                {inc.photoUrl ? <img src={inc.photoUrl} alt="photo" className="w-full h-full object-cover" /> : <p className="text-zinc-400 text-[10px]">No photo</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// keep IncidentReportForm empty for backward compat (dashboard uses /field)
export function IncidentReportForm(_props:any){ return null; }

"use client";
import { useState } from "react";

export default function HazardSimModal({ onInject }: { onInject: (inc:any)=>void }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("landslide");
  const [sev, setSev] = useState("high");
  const inject = async () => {
    const inc = { type, description: `[SIM] ${type} injected`, severity: sev, accessibilityStatus: sev==="high"?"blocked":"delayed", location: { latitude: 26.2 + (Math.random()-0.5)*1.2, longitude: 92.9 + (Math.random()-0.5)*1.8 }, offline: false, state: "Assam", district: "Sim" };
    await fetch("/api/incidents", { method: "POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(inc)});
    onInject(inc);
    setOpen(false);
  };
  return (
    <>
      <button onClick={()=>setOpen(true)} className="px-3 py-1.5 rounded bg-amber-600 text-white text-xs font-black">⚠️ Simulate Hazard</button>
      {open && (
        <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-sm">
            <h3 className="font-black text-sm">Simulate disruption (demo)</h3>
            <select value={type} onChange={e=>setType(e.target.value)} className="mt-2 w-full border rounded px-2 py-1 text-sm"><option value="landslide">landslide</option><option value="flood">flood</option><option value="road_block">road_block</option></select>
            <select value={sev} onChange={e=>setSev(e.target.value)} className="mt-2 w-full border rounded px-2 py-1 text-sm"><option value="high">High - Blocked</option><option value="medium">Medium - Delayed</option><option value="low">Low</option></select>
            <div className="flex gap-2 mt-3"><button onClick={inject} className="flex-1 py-2 bg-slate-900 text-white rounded font-black text-sm">Inject</button><button onClick={()=>setOpen(false)} className="flex-1 py-2 border rounded font-bold text-sm">Close</button></div>
          </div>
        </div>
      )}
    </>
  );
}

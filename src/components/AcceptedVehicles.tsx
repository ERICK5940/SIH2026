"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function AcceptedVehicles() {
  const { t } = useTranslation();
  const [list, setList] = useState<any[]>([]);
  useEffect(() => {
    const load = async () => {
      try { const r = await fetch("/api/reroute"); const j = await r.json(); setList((j.reroutes||[]).filter((x:any)=>x.status==="accepted")); } catch {}
    };
    load(); const id=setInterval(load,3000); return()=>clearInterval(id);
  }, []);
  if (!list.length) return <div className="bg-white border border-slate-200 rounded-lg p-4"><h3 className="text-xs font-black tracking-widest">{t("ACCEPTED VEHICLES")}</h3><p className="text-xs text-slate-500 mt-2">No accepted yet — driver tap Accept on /driver</p></div>;
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-xs font-black tracking-widest">{t("ACCEPTED VEHICLES")} • {list.length}</h3>
      <div className="space-y-2 mt-3">
        {list.map((r:any)=>(
          <div key={r.vehicleId} className="border rounded p-2 bg-emerald-50 border-emerald-200">
            <p className="text-xs font-black">{r.vehicleId} • {r.from} → {r.to}</p><p className="text-[11px] text-slate-600">Accepted {new Date(r.acceptedAt).toLocaleTimeString("en-IN",{timeZone:"Asia/Kolkata",hour12:false})} • {r.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

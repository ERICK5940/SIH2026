"use client";
import React, { useEffect, useState } from "react";

export function DriverInbox() {
  const [notes, setNotes] = useState<any[]>([]);
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch("/api/reroute");
        const j = await r.json();
        setNotes(j.notifications?.slice(0, 3) || []);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
    const h = () => poll();
    window.addEventListener("reroute-done", h as any);
    return () => { clearInterval(id); window.removeEventListener("reroute-done", h as any); };
  }, []);

  if (notes.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
      <p className="text-[11px] font-black tracking-widest text-amber-800">🔔 DRIVER INBOX — PWA PUSH + IN-APP</p>
      {notes.map((n: any) => (
        <div key={n.id} className="bg-white border border-amber-200 rounded p-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{n.title}</p>
            <p className="text-[11px] font-semibold text-slate-600 truncate">{n.body}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => { try{ const u=new SpeechSynthesisUtterance(n.body); u.lang = (localStorage.getItem("ner-lang")==="as"?"as-IN": localStorage.getItem("ner-lang")==="hi"?"hi-IN":"en-IN"); speechSynthesis.speak(u);}catch{} }} className="px-2 py-1.5 rounded bg-sky-600 text-white text-[11px] font-black">🔊</button>
            <button
              onClick={async () => {
                await fetch("/api/reroute", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: n.vehicleId }) });
                setNotes((prev) => prev.filter((x) => x.id !== n.id));
              }}
              className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700"
            >
              Accept
            </button>
          </div>
        </div>
      ))}
      <p className="text-[10px] font-semibold text-slate-500">Auto falls back to SMS if offline • Multilingual (EN/HI/AS) via LanguageSwitcher</p>
    </div>
  );
}

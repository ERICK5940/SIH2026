"use client";

import React, { useState, useEffect } from "react";

const VEHICLES = [
  { id: "NER-1024", cargo: "medicines", route: "NH-37 Guwahati→Silchar", driver: "Ramesh Kumar" },
  { id: "NER-1025", cargo: "food", route: "NH-52 Dibrugarh→Tinsukia", driver: "Arun Singh" },
  { id: "NER-1026", cargo: "construction", route: "NH-29 Jorhat→Mokokchung", driver: "Bikash Das" },
  { id: "NER-1027", cargo: "medicines", route: "NH-157 Tezpur→Itanagar", driver: "Sunita Roy" },
  { id: "NER-1028", cargo: "food", route: "NH-31 Assam→Tripura", driver: "Mohan Lal" },
];

export default function DriverApp() {
  const [logged, setLogged] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [inbox, setInbox] = useState<any[]>([]);
  const [vehicle, setVehicle] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("driver-vehicle");
    if (saved) { setLogged(saved); setVehicle(VEHICLES.find((v) => v.id === saved)); }
  }, []);

  useEffect(() => {
    if (!logged) return;
    const poll = async () => {
      try {
        const r = await fetch("/api/reroute");
        const j = await r.json();
        const mine = (j.notifications || []).filter((n: any) => n.vehicleId === logged);
        setInbox(mine);
        const vRes = await fetch("/api/gps/ingest");
        const vj = await vRes.json();
        const v = (vj.live || []).find((x: any) => x.id === logged);
        if (v) setVehicle((prev: any) => ({ ...prev, currentLocation: v.currentLocation, lat: v.lat, lng: v.lng }));
      } catch {}
    };
    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [logged]);

  const doLogin = (vid: string) => {
    localStorage.setItem("driver-vehicle", vid);
    setLogged(vid);
    setVehicle(VEHICLES.find((v) => v.id === vid));
  };
  const login = () => {
    const raw = input.trim().toLowerCase().replace(/\s+/g, "");
    const found = VEHICLES.find((v) => v.id.toLowerCase() === raw || v.id.toLowerCase().replace("-", "") === raw || v.id.split("-")[1] === raw);
    if (!found) { alert("Vehicle ID not found. Tap a button below or type NER-1024"); return; }
    doLogin(found.id);
  };

  const logout = () => {
    localStorage.removeItem("driver-vehicle");
    setLogged(null);
    setVehicle(null);
  };

  if (!logged) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 w-full max-w-md">
          <div className="h-12 w-12 rounded bg-slate-900 text-white grid place-items-center font-black mx-auto">NER</div>
          <h1 className="text-center text-lg font-black mt-3">Driver Login</h1>
          <p className="text-center text-xs font-semibold text-slate-600 mt-1">Enter your Vehicle ID to see your assigned vehicle</p>
          <div className="mt-5 space-y-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()} placeholder="e.g. NER-1024" className="w-full px-3 py-2.5 border border-slate-200 rounded-lg font-mono font-bold text-center uppercase" />
            <button onClick={login} className="w-full py-2.5 rounded-lg bg-slate-900 text-white font-black hover:bg-black">Login</button>
            <p className="text-[11px] font-semibold text-slate-500 text-center">or tap to login</p>
            <div className="grid grid-cols-2 gap-2">
              {VEHICLES.map((v) => (
                <button key={v.id} onClick={() => doLogin(v.id)} className="py-2 rounded-lg bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700">{v.id}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded bg-white text-slate-900 grid place-items-center font-black text-xs">NER</div>
          <div>
            <p className="text-sm font-black">{vehicle?.id} • {vehicle?.cargo}</p>
            <p className="text-[11px] font-semibold opacity-80">Driver: {vehicle?.driver} • {vehicle?.route}</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs font-bold px-3 py-1.5 rounded bg-white/10 border border-white/20 hover:bg-white/20">Logout</button>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h2 className="text-sm font-black">You are driving</h2>
          <p className="text-2xl font-black text-slate-900 mt-1">{vehicle?.id}</p>
          <p className="text-sm font-bold text-slate-700">{vehicle?.cargo} • {vehicle?.route}</p>
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
            <p className="text-xs font-bold text-emerald-800">Current: {vehicle?.currentLocation || "Assam"} • {vehicle?.cargo} • On Route</p>
            <p className="text-[11px] font-semibold text-slate-600 mt-1">Assigned route: {vehicle?.route} • Tap notification to navigate</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <h3 className="text-sm font-black flex items-center gap-2">🔔 Inbox {inbox.length > 0 && <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full">{inbox.length}</span>}</h3>
          {inbox.length === 0 ? (
            <p className="text-xs font-semibold text-slate-500 mt-3">No new reroutes. You are on assigned route. Drive safe!</p>
          ) : (
            <div className="space-y-2 mt-3">
              {inbox.map((n: any) => (
                <div key={n.id} className="border-2 border-amber-300 bg-amber-50 rounded-lg p-3">
                  <p className="text-sm font-black text-slate-900">{n.title}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-1">{n.body}</p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        await fetch("/api/reroute", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ vehicleId: n.vehicleId }) });
                        setInbox((prev) => prev.filter((x) => x.id !== n.id));
                      }}
                      className="flex-1 py-2 rounded bg-emerald-600 text-white text-xs font-black"
                    >
                      ✓ Accept & Navigate
                    </button>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(n.to || "Silchar")}`, "_blank")} className="px-3 py-2 rounded bg-white border border-slate-200 text-xs font-bold">Map</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {inbox.length === 0 && vehicle && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
            <p className="text-xs font-bold text-emerald-800">✓ Route updated — drive safe!</p>
          </div>
        )}
      </div>
    </div>
  );
}

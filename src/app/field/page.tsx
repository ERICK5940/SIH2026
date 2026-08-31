"use client";
import React, { useState, useEffect, useRef } from "react";

const ROLES = ["Field Officer", "BRO Officer", "District Magistrate", "NHAI Engineer", "Local Authority", "NDMA Volunteer"];

export default function FieldPage() {
  const [authority, setAuthority] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [type, setType] = useState("landslide");
  const [desc, setDesc] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [access, setAccess] = useState("blocked");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gpsStatus, setGpsStatus] = useState("Tap 📍 Get GPS");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [saving, setSaving] = useState(false);

  const getGps = () => {
    if (!navigator.geolocation) { setGpsStatus("GPS not supported"); return; }
    setGpsStatus("Fetching…");
    navigator.geolocation.getCurrentPosition((p) => {
      setLat(p.coords.latitude); setLng(p.coords.longitude); setGpsStatus(`✓ ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`);
    }, (e) => setGpsStatus("Error: " + e.message), { enableHighAccuracy: true });
  };

  const [camErr, setCamErr] = useState<string | null>(null);
  const startCam = async () => {
    setCamErr(null);
    try {
      // localhost is secure context, but try environment first then fallback to user
      let s: MediaStream | null = null;
      try { s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } }); } catch {}
      if (!s) s = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.muted = true; await videoRef.current.play().catch(()=>{}); }
      streamRef.current = s; setCamOn(true);
    } catch (e: any) {
      const msg = e?.name === "NotAllowedError" ? "Camera permission denied — please Allow camera in browser" : e?.name === "NotFoundError" ? "No camera found on this device — use File upload" : "Camera not available: " + (e?.message || e);
      setCamErr(msg); alert(msg);
    }
  };
  const stopCam = () => { streamRef.current?.getTracks().forEach(t => t.stop()); setCamOn(false); };
  const capture = () => {
    if (!videoRef.current) return;
    const c = document.createElement("canvas"); c.width = videoRef.current.videoWidth; c.height = videoRef.current.videoHeight;
    c.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setPhoto(c.toDataURL("image/jpeg", 0.7));
    if (lat === null) getGps();
  };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f);
    if (lat === null) getGps();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !authority.trim()) { alert("Authority + description required"); return; }
    if (lat === null || lng === null) { alert("Tap Get GPS first"); return; }
    setSaving(true);
    const report = { id: Date.now().toString(), type, description: `${authority} (${role}): ${desc}`, photoUrl: photo, location: { latitude: lat, longitude: lng }, severity, accessibilityStatus: access, timestamp: new Date().toISOString(), offline: !navigator.onLine, authority, role };
    try {
      const r = await fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(report) });
      if (r.ok) { alert("✓ Report submitted — central dashboard updated"); setDesc(""); setPhoto(null); }
      else throw new Error();
    } catch {
      // offline queue fallback
      const q = JSON.parse(localStorage.getItem("offline-reports") || "[]"); q.push(report); localStorage.setItem("offline-reports", JSON.stringify(q));
      alert("⚠️ Offline — queued locally, will sync when online");
    }
    setSaving(false);
  };

  // sync offline queue when online
  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const q = JSON.parse(localStorage.getItem("offline-reports") || "[]");
      if (q.length === 0) return;
      for (const rep of q) await fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(rep) }).catch(() => {});
      localStorage.removeItem("offline-reports");
    };
    window.addEventListener("online", sync); return () => window.removeEventListener("online", sync);
  }, []);

  return (
    <div className="min-h-screen bg-[#eef2f7] p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <header className="bg-slate-900 text-white rounded-lg p-4 flex items-center justify-between">
          <div>
            <h1 className="font-black text-lg">FIELD OFFICER REPORTING</h1>
            <p className="text-xs opacity-80">Geo-tagged • Photo • Live GPS • Offline queue</p>
          </div>
          <a href="/" className="text-xs font-bold px-3 py-1.5 rounded bg-white text-slate-900">← Dashboard</a>
        </header>

        <form onSubmit={submit} className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black tracking-widest">AUTHORITY NAME</label>
              <input value={authority} onChange={e => setAuthority(e.target.value)} placeholder="e.g. R. Singh" className="mt-1 w-full px-3 py-2 border rounded-lg text-sm font-semibold" required />
            </div>
            <div>
              <label className="text-xs font-black tracking-widest">ROLE</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm font-bold">
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black">Incident Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                <option value="landslide">Landslide</option><option value="flood">Flood</option><option value="road_block">Road Blocked</option><option value="accident">Accident</option><option value="maintenance">Maintenance</option><option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-black">Severity</label>
              <select value={severity} onChange={e => setSeverity(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-black">Accessibility</label>
            <select value={access} onChange={e => setAccess(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm">
              <option value="accessible">Accessible</option><option value="delayed">Delayed</option><option value="high_risk">High Risk</option><option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-black">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 border rounded-lg text-sm" placeholder="Describe incident..." required />
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <p className="text-xs font-black tracking-widest">LIVE GPS (geo-tag)</p>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={getGps} className="px-3 py-1.5 rounded bg-sky-600 text-white text-xs font-black">📍 Get GPS</button>
              <span className="text-xs font-semibold text-slate-700 self-center">{gpsStatus}</span>
            </div>
            {lat !== null && <p className="text-xs font-mono mt-2">{lat.toFixed(6)}, {lng?.toFixed(6)}</p>}
          </div>

          <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
            <p className="text-xs font-black tracking-widest">PHOTO — File upload + Live GPS Cam</p>
            <input type="file" accept="image/*" onChange={onFile} className="mt-2 text-xs w-full" />
            <div className="flex gap-2 mt-3">
              {!camOn ? <button type="button" onClick={startCam} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-black">📷 Open Cam</button> : <button type="button" onClick={stopCam} className="px-3 py-1.5 rounded bg-slate-700 text-white text-xs font-black">■ Close Cam</button>}
              {camOn && <button type="button" onClick={capture} className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-black">Capture</button>}
            </div>
            {camErr && <p className="text-xs font-bold text-red-600 mt-2">{camErr}</p>}
            {camOn && <video ref={videoRef} autoPlay playsInline muted className="mt-3 w-full rounded-lg bg-black h-48 object-cover" />}
            {photo && <img src={photo} alt="preview" className="mt-3 w-full rounded-lg border h-48 object-cover bg-white" />}
          </div>

          <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-slate-900 text-white font-black hover:bg-black disabled:opacity-50">{saving ? "Saving…" : "Submit Geo-tagged Report"}</button>
          <p className="text-[11px] text-slate-500 text-center">Offline? Queued in localStorage → auto sync when online → central dashboard + GIS map pin + Alert Center</p>
        </form>
      </div>
    </div>
  );
}

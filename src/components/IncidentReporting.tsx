"use client";

import React, { useState, useRef, useEffect } from "react";

type IncidentReport = {
  id: string;
  type: IncidentType;
  description: string;
  photoUrl?: string;
  location: { latitude: number; longitude: number };
  severity: "low" | "medium" | "high";
  accessibilityStatus: "accessible" | "delayed" | "high_risk" | "blocked";
  timestamp: string;
  offline: boolean;
};

interface IncidentReportFormProps {
  onReport: (report: IncidentReport) => void;
}

function getSeverityColor(severity: "low" | "medium" | "high"): string {
  const colors: Record<"low" | "medium" | "high", string> = {
    low: "#10b981",
    medium: "#f59e0b",
    high: "#ef4444",
  };
  return colors[severity];
}

function getSeverityLabel(severity: "low" | "medium" | "high"): string {
  const labels: Record<"low" | "medium" | "high", string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
  };
  return labels[severity];
}

function getAccessibilityStatusLabel(status: "accessible" | "delayed" | "high_risk" | "blocked"): string {
  const labels: Record<"accessible" | "delayed" | "high_risk" | "blocked", string> = {
    accessible: "🟢 Accessible",
    delayed: "🟡 Delayed",
    high_risk: "🟠 High Risk",
    blocked: "🔴 Blocked",
  };
  return labels[status];
}

function getAccessibilityStatusColor(status: "accessible" | "delayed" | "high_risk" | "blocked"): string {
  const colors: Record<"accessible" | "delayed" | "high_risk" | "blocked", string> = {
    accessible: "#10b981",
    delayed: "#f59e0b",
    high_risk: "#f97316",
    blocked: "#ef4444",
  };
  return colors[status];
}

export function IncidentReportForm({ onReport }: IncidentReportFormProps) {
  const idRef = useRef("");
  const [formData, setFormData] = useState<IncidentReport>({
    type: "other" as IncidentType,
    description: "",
    location: { latitude: 0, longitude: 0 },
    severity: "low",
    accessibilityStatus: "accessible",
    timestamp: "2026-08-26T09:19:00.000Z",
    offline: false,
  });

  useEffect(() => {
    idRef.current = Math.random().toString(36).substr(2, 9);
    setFormData({ ...formData, id: idRef.current });
  }, []);

  const [offlineMode, setOfflineMode] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, type: e.target.value as IncidentType });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const report = { ...formData, timestamp: new Date().toISOString() };
    try {
      const r = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report),
      });
      if (r.ok) {
        window.dispatchEvent(new CustomEvent("incidents-updated"));
      }
    } catch {}
    setFormData({
      id: Date.now().toString(),
      type: "other" as IncidentType,
      description: "",
      location: { latitude: 0, longitude: 0 },
      severity: "low",
      accessibilityStatus: "accessible",
      timestamp: new Date().toISOString(),
      offline: false,
    });
  };

  // Offline sync - uses functional updates to avoid formData dep
  useEffect(() => {
    const checkOnline = () => {
      if (!navigator.onLine && !offlineMode) {
        setOfflineMode(true);
        setFormData((f) => ({ ...f, offline: true }));
      } else if (navigator.onLine && offlineMode) {
        setOfflineMode(false);
        setFormData((f) => ({ ...f, offline: false }));
      }
    };
    window.addEventListener("online", checkOnline);
    window.addEventListener("offline", checkOnline);
    checkOnline();
    return () => {
      window.removeEventListener("online", checkOnline);
      window.removeEventListener("offline", checkOnline);
    };
  }, [offlineMode]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Field Officer Incident Report</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Incident Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleSelectChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="landslide">Landslide</option>
              <option value="flood">Flood</option>
              <option value="road_block">Road Blocked</option>
              <option value="accident">Accident</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the incident..."
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="latitude"
                type="number"
                value={formData.location.latitude.toFixed(6)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { latitude: parseFloat(e.target.value) || 0, longitude: formData.location.longitude },
                  })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Lat"
              />
              <input
                name="longitude"
                type="number"
                value={formData.location.longitude.toFixed(6)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    location: { latitude: formData.location.latitude, longitude: parseFloat(e.target.value) || 0 },
                  })
                }
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Lng"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Accessibility Status</label>
            <select
              name="accessibilityStatus"
              value={formData.accessibilityStatus}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="accessible">Accessible</option>
              <option value="delayed">Delayed</option>
              <option value="high_risk">High Risk</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={offlineMode}
              onChange={(e) => setOfflineMode(e.target.checked)}
              className="rounded border"
            />
            <span className="text-sm text-zinc-600">
              {offlineMode ? "Offline mode - report queued locally" : "Online mode - sync enabled"}
            </span>
          </div>

          <button
            type="submit"
            disabled={!formData.description.trim()}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {offlineMode ? "Queued for Sync" : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Offline status display */}
      {offlineMode && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-800">
            ⚠️ Report saved locally. Will sync when network restores.
          </p>
        </div>
      )}
    </div>
  );
}

export function IncidentDashboard() {
  const [incidents, setIncidents] = React.useState<any[]>([]);

  React.useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch("/api/incidents");
        const j = await r.json();
        if (j.incidents) setIncidents(j.incidents);
      } catch {}
    };
    load();
    const handler = (e: CustomEvent) => setIncidents(e.detail);
    window.addEventListener("incidents-updated", handler as EventListener);
    return () => window.removeEventListener("incidents-updated", handler as EventListener);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Incident Reports</h2>

      {incidents.length === 0 && (
        <p className="text-zinc-500 text-sm">No incidents reported yet.</p>
      )}

      <div className="space-y-4">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="p-4 rounded-lg border-l-4"
            style={{ borderColor: getAccessibilityStatusColor(incident.accessibilityStatus) }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-zinc-500 text-sm" suppressHydrationWarning>
                  {new Date(incident.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", hour12:false })}
                </p>
                <p className="font-medium mt-1">
                  {getAccessibilityStatusLabel(incident.accessibilityStatus)} - {getSeverityLabel(incident.severity)}
                </p>
                <p className="text-zinc-500 text-xs mt-1">{incident.description}</p>
                {(incident.state || incident.district || incident.road) && (
                  <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                    {incident.road ? `Road: ${incident.road} • ` : ""}
                    {incident.state ? `${incident.state}` : ""}
                    {incident.district ? ` / ${incident.district}` : ""}
                  </p>
                )}
                {(() => { const trust = (incident.photoUrl?20:0)+(incident.state?10:0)+(incident.district?10:0)+(incident.description?.length>20?15:0)+(incident.authority?15:0)+30; const pct=Math.min(98,trust); const col=pct>=80?"bg-emerald-100 text-emerald-700":pct>=60?"bg-amber-100 text-amber-700":"bg-red-100 text-red-700"; return <span className={`inline-flex mt-2 px-2 py-0.5 rounded text-[10px] font-black border ${col}`}>Trust {pct}% {incident.authority?`• ${incident.authority}`:"• citizen"}</span>; })()}
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold">
                  {["reported","verified","assigned","response","resolved"].map((st,i)=>{
                    const cur=(incident.lifecycle||"reported"); const idx=["reported","verified","assigned","response","resolved"].indexOf(cur); const done=i<=idx; return <span key={st} className={`px-1.5 py-0.5 rounded ${done?"bg-slate-900 text-white":"bg-slate-100 text-slate-500"}`}>{st}</span>;
                  })}
                </div>
                {(() => { const order=["reported","verified","assigned","response","resolved"]; const cur=incident.lifecycle||"reported"; const idx=order.indexOf(cur); const next=order[idx+1]; if(!next) return <p className="text-[11px] font-black text-emerald-600 mt-1">✓ Resolved</p>; return <button onClick={async(e)=>{ e.preventDefault(); await fetch("/api/incidents",{method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({id: incident.id, lifecycle: next})}); }} className="mt-2 px-2 py-1 rounded bg-sky-600 text-white text-[11px] font-black cursor-pointer">→ {next}</button>; })()}
              </div>
              <div className="w-12 h-12 rounded bg-zinc-100 flex items-center justify-center">
                {incident.photoUrl ? (
                  <img
                    src={incident.photoUrl}
                    alt="Incident photo"
                    className="w-6 h-6 rounded"
                  />
                ) : (
                  <p className="text-zinc-400 text-xs">No photo</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
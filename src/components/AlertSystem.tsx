import React from "react";

type AlertLevel = "critical" | "warning" | "informational";
type AlertCategory =
  | "route_blocked"
  | "weather"
  | "delay"
  | "field_update"
  | "vehicle_status"
  | "route_reopened";

interface Alert {
  id: string;
  level: AlertLevel;
  category: AlertCategory;
  title: string;
  message: string;
  timestamp: string;
  action?: string;
  vehicleId?: string;
  routeId?: string;
}

const alertLevelConfig: Record<AlertLevel, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "🔴 Critical" },
  warning: { color: "#f97316", label: "🟠 Warning" },
  informational: { color: "#3b82f6", label: "🔵 Informational" },
};

const alertCategoryIcons: Record<AlertCategory, string> = {
  route_blocked: "🛑",
  weather: "🌧️",
  delay: "⏳",
  field_update: "📍",
  vehicle_status: "🚗",
  route_reopened: "✅",
};

function getAlertPriorityColor(level: AlertLevel): string {
  return alertLevelConfig[level].color;
}

function getAlertPriorityLabel(level: AlertLevel): string {
  return alertLevelConfig[level].label;
}

export function AlertCenter({
  alerts, onAction,
}: {
  alerts: Alert[];
  onAction?: (alert: Alert) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Alert Center</h2>

      {alerts.length === 0 && (
        <p className="text-zinc-500 text-sm">No active alerts.</p>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        {["critical", "warning", "informational"].map((level) => {
          const levelAlerts = alerts.filter((a) => a.level === level);
          return (
            <div
              key={level}
              className="p-4 rounded-lg"
              style={{
                background: `${alertLevelConfig[level].color}/10`,
                border: `1px solid ${alertLevelConfig[level].color}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{getAlertPriorityLabel(level)}</p>
                  <p className="text-xs text-zinc-500">{levelAlerts.length} alerts</p>
                </div>
                <p className="text-xl font-bold" style={{ color: alertLevelConfig[level].color }}>
                  {levelAlerts.length}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full">
          <thead>
            <tr className="border-b bg-zinc-100">
              <th className="p-3 text-left text-sm font-medium w-[110px]">Level</th>
              <th className="p-3 text-left text-sm font-medium w-[90px]">Route</th>
              <th className="p-3 text-left text-sm font-medium w-[85px]">Category</th>
              <th className="p-3 text-left text-sm font-medium w-[110px]">Title</th>
              <th className="p-3 text-left text-sm font-medium">Message</th>
              <th className="p-3 text-left text-sm font-medium w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert) => (
              <tr
                key={alert.id}
                className="border-b hover:bg-zinc-50 align-top"
                style={{ background: `${alertLevelConfig[alert.level].color}/5` }}
              >
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-[10px] ${getAlertPriorityColor(alert.level)}`}
                  >
                    {getAlertPriorityLabel(alert.level)}
                  </span>
                </td>
                <td className="p-3 text-xs font-black text-slate-700 max-w-[90px] truncate">{(alert as any).routeId || "—"}</td>
                <td className="p-3">
                  <span className="text-zinc-400 text-xs">
                    {alertCategoryIcons[alert.category]}
                  </span>
                  <p className="text-zinc-500 text-xs mt-1 break-words">{alert.category}</p>
                </td>
                <td className="p-3 font-medium text-sm max-w-[110px] truncate">{alert.title}</td>
                <td className="p-3 text-zinc-500 text-xs max-w-[320px] break-all whitespace-normal leading-snug">{alert.message}</td>
                <td className="p-3">
                  {alert.action ? (
                    alert.action.toLowerCase().includes("reroute") ? (
                      <button onClick={() => onAction?.(alert)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-black hover:bg-emerald-700">{alert.action}</button>
                    ) : (
                      <span className="text-xs font-bold text-slate-700">{alert.action}</span>
                    )
                  ) : (
                    <span className="text-zinc-400 text-xs">No action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
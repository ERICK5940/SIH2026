"use client";

import React from "react";

type EmergencyModeStatus = "inactive" | "active";

interface EmergencyVehicle {
  id: string;
  cargo: string;
  currentLocation: string;
  destination: string;
  etaMinutes: number;
  priority: "critical" | "high" | "medium";
  status: "active" | "rerouted" | "delivered";
}

interface EmergencyModeProps {
  status: EmergencyModeStatus;
  triggeredAt: Date;
  vehicles: EmergencyVehicle[];
  blockedRoutes: string[];
  criticalDistricts: string[];
}

function getPriorityColor(priority: "critical" | "high" | "medium"): string {
  const colors: Record<"critical" | "high" | "medium", string> = {
    critical: "#ef4444",
    high: "#f97316",
    medium: "#f59e0b",
  };
  return colors[priority];
}

function getPriorityLabel(priority: "critical" | "high" | "medium"): string {
  const labels: Record<"critical" | "high" | "medium", string> = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
  };
  return labels[priority];
}

export function EmergencyModeToggle({
  status,
  onToggle,
}: {
  status?: EmergencyModeStatus;
  onToggle: (status: EmergencyModeStatus) => void;
}) {
  // Controlled when status is provided (dashboard), otherwise fallback to internal
  const [internal, setInternal] = React.useState<EmergencyModeStatus>("inactive");
  const isActive = (status ?? internal) === "active";

  const handle = () => {
    const next: EmergencyModeStatus = isActive ? "inactive" : "active";
    if (status === undefined) setInternal(next);
    onToggle(next);
  };

  return (
    <div>
      <button
        onClick={handle}
        className={`px-4 py-2.5 rounded font-black text-xs tracking-widest transition-colors border shadow-sm ${isActive ? "bg-white text-red-700 border-white hover:bg-red-50" : "bg-red-600 text-white border-red-600 hover:bg-red-700"}`}
      >
        {isActive ? "EXIT EMERGENCY" : "EMERGENCY MODE"}
      </button>
    </div>
  );
}

export function EmergencyDashboard({
  status,
  triggeredAt,
  vehicles,
  blockedRoutes,
  criticalDistricts,
}: EmergencyModeProps) {
  const isEmergency = status === "active";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-2xl font-bold">
          {" "}{isEmergency ? "EMERGENCY MODE ACTIVATED" : "LOGISTICS COMMAND CENTER"}
        </h1>
        <button
          onClick={() => {
            // Toggle emergency mode
          }}
          className="px-4 py-2 bg-red-600 rounded text-white"
        >
          {isEmergency ? "Exit Emergency" : "Enter Emergency"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

        {/* Emergency Corridors */}
        <div>
          <h2 className="text-lg font-medium mb-4">Emergency Corridors</h2>
          {isEmergency ? (
            <ul className="space-y-2">
              <li className="p-3 rounded-lg bg-red-500/10 border-red-500">
                NH-37 Alternative Corridor B - Priority for medical supplies
              </li>
              <li className="p-3 rounded-lg bg-red-500/10 border-red-500">
                NH-52 Relief Route - Food supply corridor
              </li>
              <li className="p-3 rounded-lg bg-red-500/10 border-red-500">
                NH-157 Rescue Route - Emergency access
              </li>
            </ul>
          ) : (
            <p className="text-zinc-500">No active emergencies</p>
          )}
        </div>

        {/* Blocked Routes */}
        <div>
          <h2 className="text-lg font-medium mb-4">Blocked Routes</h2>
          {isEmergency ? (
            <ul className="space-y-2">
              {blockedRoutes.map((route) => (
                <li
                  key={route}
                  className="p-3 rounded-lg bg-red-500/10 border-red-400"
                >
                  {route}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500">No blocked routes</p>
          )}
        </div>

        {/* Critical Districts */}
        <div>
          <h2 className="text-lg font-medium mb-4">Critical Districts</h2>
          {isEmergency ? (
            <ul className="space-y-2">
              {criticalDistricts.map((district) => (
                <li
                  key={district}
                  className="p-3 rounded-lg bg-red-500/10 border-red-400"
                >
                  {district}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500">No critical districts</p>
          )}
        </div>

        {/* Priority Vehicles */}
        <div>
          <h2 className="text-lg font-medium mb-4">Priority Vehicles</h2>
          {isEmergency && vehicles.length > 0 ? (
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="p-4 rounded-lg"
                  style={{
                    background: isEmergency
                      ? "rgba(254, 243, 199, 0.5)"
                      : "rgba(255, 255, 255, 0.5)",
                    border: isEmergency
                      ? `2px solid ${getPriorityColor(vehicle.priority)}`
                      : "1px solid transparent",
                  }}
                >
                  <div className="flex items-between justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">{vehicle.id}</p>
                        <p className="text-zinc-400 text-sm">({vehicle.cargo})</p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-[10px] ${getPriorityColor(vehicle.priority)}`}
                      >
                        {getPriorityLabel(vehicle.priority)}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{Math.round(vehicle.etaMinutes / 60)}h ETA</p>
                      <p className="text-xs text-zinc-400">{vehicle.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-500">No vehicles in transit</p>
          )}
        </div>
      </div>
    </div>
  );
}
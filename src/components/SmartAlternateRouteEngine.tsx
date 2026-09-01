import React from "react";

type RouteStatus = "accessible" | "delayed" | "high_risk" | "blocked";

interface RouteOption {
  id: string;
  name: string;
  distance: number; // km
  travelTime: number; // minutes
  status: RouteStatus;
  riskScore: number; // 0-100, lower is better
  accessibility: number; // 0-100, higher is better
  delayProbability: number; // 0-100, lower is better
  weatherRisk: number; // 0-100, lower is better
}

interface AlternateRouteEngineProps {
  currentRoute: RouteOption;
  availableAlternatives: RouteOption[];
  weather: {
    severity: "clear" | "cloudy" | "rain" | "storm";
    rainfall: number;
  };
  vehicleLocation?: string;
  vehicleId?: string;
}

interface RouteRecommendation {
  recommendedRoute: RouteOption;
  scoreBreakdown: {
    travelTimeScore: number;
    riskScore: number;
    accessibilityScore: number;
    delayProbabilityScore: number;
    totalScore: number;
  };
  rationale: string;
}

function calculateRouteScore(
  route: RouteOption,
  weatherSeverity: "clear" | "cloudy" | "rain" | "storm"
): number {
  // Score formula: Travel Time + Risk Score + Accessibility + Delay Probability
  // Lower score = better route

  // Normalize travel time (assume max reasonable time of 600 minutes = 10 hours)
  const timeScore = route.travelTime / 6;

  // Risk score (inverted - lower risk is better, but we want lower total score)
  const risk = route.riskScore;

  // Accessibility (inverted - higher accessibility is better)
  const accessibility = 100 - route.accessibility;

  // Delay probability (lower is better)
  const delay = route.delayProbability;

  // Weather adjustment
  let weatherAdjustment = 0;
  if (weatherSeverity === "storm") weatherAdjustment = 15;
  else if (weatherSeverity === "rain") weatherAdjustment = 10;
  else if (weatherSeverity === "cloudy") weatherAdjustment = 5;

  return Math.round(timeScore + risk + accessibility + delay + weatherAdjustment);
}

function getStatusColor(status: RouteStatus): string {
  const colors: Record<RouteStatus, string> = {
    accessible: "#10b981",
    delayed: "#f59e0b",
    high_risk: "#f97316",
    blocked: "#ef4444",
  };
  return colors[status];
}

function getStatusLabel(status: RouteStatus): string {
  const labels: Record<RouteStatus, string> = {
    accessible: "🟢 Accessible",
    delayed: "🟡 Delayed",
    high_risk: "🟠 High Risk",
    blocked: "🔴 Blocked",
  };
  return labels[status];
}

const statusColors: Record<RouteStatus, string> = {
  accessible: "#10b981",
  delayed: "#f59e0b",
  high_risk: "#f97316",
  blocked: "#ef4444",
};

const statusLabels: Record<RouteStatus, string> = {
  accessible: "🟢 Accessible",
  delayed: "🟡 Delayed",
  high_risk: "🟠 High Risk",
  blocked: "🔴 Blocked",
};

function fmtHrsMins(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} hrs`;
}

export function SmartAlternateRouteEngine({
  currentRoute,
  availableAlternatives,
  weather,
  vehicleLocation,
  vehicleId,
}: AlternateRouteEngineProps) {
  const [liveDist, setLiveDist] = React.useState<Record<string, { distance: number; duration: number; source: string }>>({});
  React.useEffect(() => {
    (async () => {
      for (const alt of availableAlternatives) {
        try {
          // Valhalla truck-aware with vehicle current location
          const fromVehicle = vehicleLocation ? (() => {
            // Parse "26.50,92.90" from liveVehicles currentLocation
            const m = vehicleLocation.match(/([\d.]+),([\d.]+)/);
            return m ? [parseFloat(m[1]), parseFloat(m[2])] as [number, number] : null;
          })() : null;
          const r = await fetch("/api/route-valhalla", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ routeName: alt.name, fromVehicle }) });
          const j = await r.json();
          setLiveDist((m) => ({ ...m, [alt.name]: j }));
        } catch {}
      }
    })();
  }, [JSON.stringify(availableAlternatives.map((a) => a.name)), vehicleLocation]);

  // Vehicle-aware scoring: if vehicleLocation provided, remaining distance is from vehicle, not start
  const scoredRoutes = availableAlternatives.map((alt) => {
    const live = liveDist[alt.name];
    let effective = live ? { ...alt, distance: live.distance, travelTime: live.duration } : alt;
    // Adjust for vehicle current location — closer to alternate start = shorter remaining
    if (vehicleLocation) {
      const locFactor = vehicleLocation.includes("Assam") ? 0.85 : vehicleLocation.includes("Arunachal") ? 1.1 : vehicleLocation.includes("Mizoram") ? 0.6 : 1.0;
      effective = { ...effective, distance: Math.round(effective.distance * locFactor), travelTime: Math.round(effective.travelTime * locFactor) };
    }
    return { ...effective, orig: alt, score: calculateRouteScore(effective, weather.severity), liveSource: live?.source || "static", vehicleAdjusted: !!vehicleLocation };
  });

  // Sort by score (lower is better)
  scoredRoutes.sort((a, b) => a.score - b.score);

  const recommendedRoute = scoredRoutes[0];

  // Calculate score breakdown for recommended route
  const scoreBreakdown = {
    travelTimeScore: recommendedRoute.travelTime / 6,
    riskScore: recommendedRoute.riskScore,
    accessibilityScore: 100 - recommendedRoute.accessibility,
    delayProbabilityScore: recommendedRoute.delayProbability,
    totalScore: recommendedRoute.score,
  };

  // Build rationale
  const rationaleParts: string[] = [];

  if (recommendedRoute.status === "accessible") {
    rationaleParts.push("Full accessibility throughout route");
  } else if (recommendedRoute.status === "delayed") {
    rationaleParts.push("Managed delay conditions");
  } else if (recommendedRoute.status === "high_risk") {
    rationaleParts.push("Requires careful monitoring");
  }

  // Compare with current route
  const currentScore = calculateRouteScore(currentRoute, weather.severity);
  if (recommendedRoute.score < currentScore) {
    rationaleParts.push(
      `Better than current route (current: ${currentScore}, recommended: ${recommendedRoute.score})`
    );
  }

  const rationale = rationaleParts.join(". ");

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Smart Alternate Route Engine</h3>
        {vehicleId && <span className="text-[11px] font-bold px-2 py-1 rounded bg-sky-100 text-sky-700 border border-sky-200">Vehicle {vehicleId} • {vehicleLocation}</span>}
      </div>
      {vehicleLocation && (
        <div className="mb-4 p-2.5 bg-sky-50 border border-sky-200 rounded text-xs font-semibold text-sky-800">
          📍 Calculated from vehicle current location: <b>{vehicleLocation}</b> — remaining distance adjusted for {vehicleId || "selected vehicle"} (not from route start)
        </div>
      )}
      {!vehicleLocation && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-800">
          ℹ Select a vehicle via <b>Focus</b> in Vehicle Tracking to see location-aware alternate (currently showing from route start)
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-zinc-500 text-sm">Current Route ({currentRoute.name})</p>
          <div>
            <p className="font-medium">{currentRoute.name}</p>
            <p className={`text-sm ${currentRoute.status === "blocked" ? "text-red-600" : currentRoute.status === "high_risk" ? "text-orange-600" : "text-green-600"}`}>
              {currentRoute.status === "blocked"
                ? "🔴 Blocked"
                : currentRoute.status === "high_risk"
                  ? "🟠 High Risk"
                  : "🟢 Accessible"}
            </p>
            <p className="text-sm">Score: {currentScore} pts (Total)</p>
          </div>
        </div>
          <div>
            <p className="text-zinc-500 text-sm">Recommended Route</p>
            <div>
              <p className="font-medium">{recommendedRoute.name}</p>
              <p className={`text-sm ${recommendedRoute.status === "blocked" ? "text-red-600" : recommendedRoute.status === "high_risk" ? "text-orange-600" : "text-green-600"}`}>
                {recommendedRoute.status === "blocked"
                  ? "🔴 Blocked"
                  : recommendedRoute.status === "high_risk"
                    ? "🟠 High Risk"
                    : "🟢 Accessible"}
              </p>
              <p className="text-sm">Score: {recommendedRoute.score} pts (Total)</p>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-zinc-500 text-sm">Travel Time (Valhalla truck)</p>
          <p className="font-medium">{fmtHrsMins(recommendedRoute.travelTime)} { (recommendedRoute as any).liveSource?.includes("Valhalla") && <span className="text-[10px] font-bold text-emerald-600">• Valhalla</span>}</p>
          <p className="text-xs text-zinc-500">+{Math.round(recommendedRoute.travelTime / 6)} pts • {(recommendedRoute as any).liveSource || "static"} • {vehicleLocation ? "from vehicle" : "from start"}</p>
        </div>
        <div>
          <p className="text-zinc-500 text-sm">Risk Score</p>
          <p className="font-medium">{recommendedRoute.riskScore}</p>
          <p className="text-xs text-zinc-500">pts</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div>
          <p className="text-zinc-500 text-sm">Accessibility</p>
          <p className="font-medium">{recommendedRoute.accessibility}</p>
          <p className="text-xs text-zinc-500">pts (100-{recommendedRoute.accessibility})</p>
        </div>
        <div>
          <p className="text-zinc-500 text-sm">Delay Probability</p>
          <p className="font-medium">{recommendedRoute.delayProbability}</p>
          <p className="text-xs text-zinc-500">pts</p>
        </div>
        <div>
          <p className="text-zinc-500 text-sm">Weather Risk</p>
          <p className="font-medium">{recommendedRoute.weatherRisk}</p>
          <p className="text-xs text-zinc-500">pts</p>
        </div>
        <div>
          <p className="text-zinc-500 text-sm">Total Score</p>
          <p className="font-medium text-xl">
            {recommendedRoute.score}
          </p>
          <p className="text-xs text-zinc-500">pts</p>
        </div>
      </div>

      <div>
        <p className="text-zinc-500 text-sm">Rationale</p>
        <p className="text-medium">{recommendedRoute.status === "accessible" ? "Lowest risk suitable route wins - based on combined scoring of time, risk, accessibility and delay probability, not just shortest distance." : rationale}</p>
      </div>

      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium mb-3">Route Comparison</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed w-full">
            <thead>
              <tr className="border-b bg-zinc-100">
                <th className="p-3 text-left text-sm font-medium">Route</th>
                <th className="p-3 text-left text-sm font-medium">Score</th>
                <th className="p-3 text-left text-sm font-medium">Status</th>
                <th className="p-3 text-left text-sm font-medium">Travel Time</th>
              </tr>
            </thead>
            <tbody>
              {scoredRoutes.map((route) => (
                <tr
                  key={route.id}
                  className="border-b hover:bg-zinc-50"
                >
                  <td className="p-3 font-medium">{route.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${route.score === recommendedRoute.score ? "bg-primary-100 text-primary-800" : ""}`}>
                      {route.score}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${statusColors[route.status]}`}>
                      {statusLabels[route.status]}
                    </span>
                  </td>
                  <td className="p-3">{fmtHrsMins(route.travelTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
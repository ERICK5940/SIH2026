import { NextRequest, NextResponse } from "next/server";

// OSRM free - per-NH meaningful alternates
const ROUTE_COORDS: Record<string, [number, number][]> = {
  "NH-37": [[26.1445,91.7362],[26.35,92.68],[26.75,94.2],[24.82,92.79]],
  "Brahmaputra South Bypass (via Lumding)": [[26.1445,91.7362],[26.0,92.8],[25.6,93.2],[25.0,93.5],[24.82,92.79]],
  "Hill Route via Tezpur-Bomdila": [[26.1445,91.7362],[26.63,92.79],[27.06,92.5],[26.8,93.0],[24.82,92.79]],
  "SH-12 Internal (Haflong Villages)": [[26.1445,91.7362],[25.8,92.5],[25.2,92.8],[24.82,92.79]],
  "North Bank via Dhemaji": [[27.48,94.91],[28.0,95.2],[28.2,95.6],[27.8,95.8]],
  "Eastern via Sadiya Ferry": [[27.48,94.91],[27.9,95.8],[28.1,96.0],[27.9,96.2]],
  "SH-15 Rural (Doom Dooma)": [[27.48,94.91],[27.6,95.0],[27.8,95.2],[27.9,95.4]],
  "Bomdila Hill Bypass": [[26.63,92.79],[27.0,92.5],[27.4,93.0],[27.3,93.5]],
  "Bhalukpong Valley Route": [[26.63,92.79],[26.8,92.9],[27.0,93.2],[27.3,93.5]],
  "Arunachal Frontier Track": [[26.63,92.79],[26.9,92.6],[27.2,93.0],[27.3,93.5]],
  "Mariani Diversion": [[26.75,94.2],[26.6,94.5],[26.4,94.7],[26.32,94.5]],
  "Amguri Corridor": [[26.75,94.2],[26.7,94.6],[26.5,94.8],[26.32,94.5]],
  "Village Link SH-8": [[26.75,94.2],[26.6,94.3],[26.4,94.4],[26.32,94.5]],
  "Karimganj Bypass": [[26.14,91.73],[25.8,92.0],[24.9,92.2],[23.84,91.28]],
  "Kailashahar Hill Route": [[26.14,91.73],[26.0,91.9],[24.8,92.5],[23.84,91.28]],
  "Tripura Internal SH-6": [[26.14,91.73],[25.5,91.88],[24.5,92.2],[23.84,91.28]],
};

export async function POST(req: NextRequest) {
  try {
    const { routeName } = await req.json();
    const coords = ROUTE_COORDS[routeName];
    if (!coords) return NextResponse.json({ distance: 210, duration: 360, source: "fallback" });
    // Use OSRM for first->last via intermediate waypoints (simplified: first to last direct)
    const [lat1, lon1] = coords[0];
    const [lat2, lon2] = coords[coords.length-1];
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) throw new Error("osrm fail");
    const j = await r.json();
    const route = j.routes?.[0];
    if (!route) throw new Error("no route");
    return NextResponse.json({
      distance: Math.round(route.distance/1000),
      duration: Math.round(route.duration/60),
      source: "OSRM live",
    });
  } catch {
    // Fallback to static if OSRM fails (still shows live intent)
    return NextResponse.json({ distance: 210, duration: 360, source: "fallback (OSRM offline)" });
  }
}

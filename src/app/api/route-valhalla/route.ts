import { NextRequest, NextResponse } from "next/server";

// Valhalla truck-aware exact routing - free, no key
const ROUTE_COORDS: Record<string, [number, number][]> = {
  "NH-37": [[26.1445,91.7362],[24.82,92.79]],
  "Brahmaputra South Bypass (via Lumding)": [[26.1445,91.7362],[25.6,93.2],[24.82,92.79]],
  "Hill Route via Tezpur-Bomdila": [[26.1445,91.7362],[26.63,92.79],[24.82,92.79]],
  "SH-12 Internal (Haflong Villages)": [[26.1445,91.7362],[25.2,92.8],[24.82,92.79]],
  "North Bank via Dhemaji": [[27.48,94.91],[28.0,95.2],[27.8,95.8]],
  "Eastern via Sadiya Ferry": [[27.48,94.91],[27.9,95.8],[27.9,96.2]],
  "SH-15 Rural (Doom Dooma)": [[27.48,94.91],[27.6,95.0],[27.9,95.4]],
  "Bomdila Hill Bypass": [[26.63,92.79],[27.0,92.5],[27.3,93.5]],
  "Bhalukpong Valley Route": [[26.63,92.79],[26.8,92.9],[27.3,93.5]],
  "Arunachal Frontier Track": [[26.63,92.79],[26.9,92.6],[27.3,93.5]],
  "Mariani Diversion": [[26.75,94.2],[26.6,94.5],[26.32,94.5]],
  "Amguri Corridor": [[26.75,94.2],[26.7,94.6],[26.32,94.5]],
  "Village Link SH-8": [[26.75,94.2],[26.6,94.3],[26.32,94.5]],
  "Karimganj Bypass": [[26.14,91.73],[25.8,92.0],[23.84,91.28]],
  "Kailashahar Hill Route": [[26.14,91.73],[26.0,91.9],[23.84,91.28]],
  "Tripura Internal SH-6": [[26.14,91.73],[25.5,91.88],[23.84,91.28]],
};

export async function POST(req: NextRequest) {
  try {
    const { routeName, fromVehicle } = await req.json();
    const coords = ROUTE_COORDS[routeName];
    if (!coords) return NextResponse.json({ distance: 210, duration: 360, source: "fallback" });

    // Use vehicle current location if provided, else route start
    let start: [number, number] = coords[0];
    if (fromVehicle && Array.isArray(fromVehicle) && fromVehicle.length===2) start = fromVehicle;

    const end = coords[coords.length-1];
    const locations = [{ lat: start[0], lon: start[1] }, { lat: end[0], lon: end[1] }];

    // Valhalla truck costing - free public instance, fallback to OSRM if fails
    const valhallaUrl = "https://valhalla1.openstreetmap.de/route";
    const body = {
      locations,
      costing: "truck",
      costing_options: {
        truck: { height: 4.11, width: 2.6, length: 21, weight: 21.77, axle_load: 9.07, hazmat: false },
      },
      directions_options: { language: "en-US" },
      avoid_polygons: [], // could add landslide zone polygon here
    };

    try {
      const r = await fetch(valhallaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        // @ts-ignore Next.js fetch revalidate
        next: { revalidate: 3600 },
      });
      if (r.ok) {
        const j = await r.json();
        const leg = j.trip?.legs?.[0]?.summary;
        if (leg) {
          return NextResponse.json({
            distance: Math.round(leg.length),
            duration: Math.round(leg.time / 60),
            source: "Valhalla truck • live",
            geometry: j.trip?.legs?.[0]?.shape, // encoded polyline for exact map
          });
        }
      }
    } catch {}

    // Fallback to OSRM if Valhalla fails
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=false`;
    const r2 = await fetch(osrmUrl, { next: { revalidate: 3600 } } as any);
    if (r2.ok) {
      const j2 = await r2.json();
      const route = j2.routes?.[0];
      if (route) return NextResponse.json({ distance: Math.round(route.distance/1000), duration: Math.round(route.duration/60), source: "OSRM fallback" });
    }

    return NextResponse.json({ distance: 210, duration: 360, source: "fallback" });
  } catch {
    return NextResponse.json({ distance: 210, duration: 360, source: "fallback" });
  }
}

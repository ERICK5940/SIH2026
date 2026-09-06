import * as turf from "@turf/turf";
import { HUBS } from "./hubs";

export function affectedVehicles(incident: { latitude: number; longitude: number }, vehicles: Record<string, any>, radiusKm = 50) {
  const pt = turf.point([incident.longitude, incident.latitude]);
  const buf = turf.buffer(pt, radiusKm, { units: "kilometers" });
  const out: any[] = [];
  Object.values(vehicles).forEach((v: any) => {
    if (v.lat == null || v.lng == null) return;
    if (turf.booleanPointInPolygon(turf.point([v.lng, v.lat]), buf as any)) out.push(v);
  });
  return out;
}

export function nearestSafeHub(incident: { latitude: number; longitude: number }, excludeDistrict?: string) {
  const pt = turf.point([incident.longitude, incident.latitude]);
  let best: any = null; let bestDist = Infinity;
  for (const h of HUBS) {
    if (excludeDistrict && h.district === excludeDistrict) continue;
    const d = turf.distance(pt, turf.point([h.lng, h.lat]), { units: "kilometers" });
    if (d < bestDist) { bestDist = d; best = { ...h, distKm: d > 500 ? Math.round(200 + (d % 200)) : Math.round(d), _actual: Math.round(d) }; }
  }
  return best;
}
export function nearestHubs(incident: { latitude: number; longitude: number }, n=3) {
  const pt = turf.point([incident.longitude, incident.latitude]);
  return [...HUBS].map(h=> {
    const d = turf.distance(pt, turf.point([h.lng,h.lat]), {units:"kilometers"});
    // For demo outside NER (Erode 2000km) scale to 200-400 as requested
    const display = d > 500 ? Math.round(200 + (d % 200)) : Math.round(d);
    return {...h, distKm: display, _actual: Math.round(d)};
  }).sort((a,b)=>a.distKm-b.distKm).slice(0,n);
}

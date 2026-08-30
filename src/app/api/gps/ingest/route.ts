import { NextRequest, NextResponse } from "next/server";

// In-memory live store (no DB needed for demo - works without paid subscription)
// When Supabase env is set, you can extend to push there
const g = globalThis as any;
if (!g.__LIVE_VEHICLES__) g.__LIVE_VEHICLES__ = new Map();
const store: Map<string, any> = g.__LIVE_VEHICLES__;

// 5 NER corridors as waypoint polylines (no teleport, smooth interpolate)
const ROUTES: Record<string, [number,number][]> = {
  "NER-1024": [[26.14,91.73],[25.9,92.3],[25.77,93.17],[25.2,92.9],[24.83,92.80]], // NH-37 Guwahati->Silchar via Lumding
  "NER-1025": [[27.48,94.91],[27.5,95.1],[27.49,95.37]], // NH-52 Dibrugarh->Tinsukia
  "NER-1026": [[26.75,94.21],[26.55,94.35],[26.32,94.52]], // NH-29 Jorhat->Mokokchung
  "NER-1027": [[26.63,92.80],[26.85,93.2],[27.08,93.62]], // NH-157 Tezpur->Itanagar
  "NER-1028": [[26.2,92.9],[25.5,92.5],[24.5,92.0],[23.83,91.28]], // NH-31 Assam->Tripura
};
// per-vehicle progress 0..1, persisted in global so no reset on reload
const pg: Map<string, number> = (g.__GPS_PROGRESS__ ??= new Map());
function lerp(a:[number,number], b:[number,number], t:number):[number,number]{ return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]; }
function posAt(route:[number,number][], p:number):[number,number]{
  if(route.length<2) return route[0]; const n=route.length-1; const scaled=p*n; const i=Math.floor(scaled); const t=scaled-i;
  if(i>=n) return route[n]; return lerp(route[i], route[i+1], t);
}

// Seed all 5 if missing then simulate gentle movement (no disturb to existing POST)
if (store.size === 0) {
  const now = new Date().toISOString();
  store.set("NER-1024", { id: "NER-1024", lat: 26.14, lng: 91.73, cargo: "medicines", currentLocation: "Guwahati", updatedAt: now });
  store.set("NER-1025", { id: "NER-1025", lat: 27.48, lng: 94.91, cargo: "food", currentLocation: "Dibrugarh", updatedAt: now });
  store.set("NER-1026", { id: "NER-1026", lat: 26.75, lng: 94.21, cargo: "construction", currentLocation: "Jorhat", updatedAt: now });
  store.set("NER-1027", { id: "NER-1027", lat: 26.63, lng: 92.80, cargo: "medicines", currentLocation: "Tezpur", updatedAt: now });
  store.set("NER-1028", { id: "NER-1028", lat: 26.2, lng: 92.9, cargo: "food", currentLocation: "Assam", updatedAt: now });
  pg.set("NER-1024",0);pg.set("NER-1025",0);pg.set("NER-1026",0);pg.set("NER-1027",0);pg.set("NER-1028",0);
}
// ensure any missing (after old deploy) seeded
for(const id of ["NER-1027","NER-1028"]){ if(!store.has(id)){ const now=new Date().toISOString(); const r=ROUTES[id]; store.set(id,{id, lat:r[0][0], lng:r[0][1], cargo:id==="NER-1027"?"medicines":"food", currentLocation:id==="NER-1027"?"Tezpur":"Assam", updatedAt:now}); pg.set(id,0);} }

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, lat, lng, cargo, currentLocation } = body;
    if (!id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "id, lat, lng required" }, { status: 400 });
    }
    store.set(id, { id, lat, lng, cargo, currentLocation: currentLocation || `${lat.toFixed(4)},${lng.toFixed(4)}`, _real: true, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, live: Array.from(store.values()) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  // advance each vehicle a tiny step (~0.007 per ~2.5s ≈ 40km/h, no teleport) unless recently POSTed via real GPS (<30s ago -> pause sim)
  const nowMs = Date.now();
  for(const [id, v] of store.entries()){
    const route = ROUTES[id]; if(!route) continue;
    // if vehicle was rerouted, keep on its new assignedRoute text but still follow original geometry for demo (no break)
    const lastUpdate = new Date(v.updatedAt).getTime();
    if(nowMs - lastUpdate < 30000 && v._real) continue; // real GPS recently, don't simulate
    let p = pg.get(id) ?? 0; p = Math.min(0.99, p + 0.007); // ~10 mins Guwahati->Silchar end-to-end
    if(p>=0.99) p=0; // loop for demo
    pg.set(id, p);
    const [lat,lng]=posAt(route, p);
    // update store in place
    store.set(id, { ...v, lat, lng, currentLocation: p<0.3 ? route[0].join(",").slice(0,12) : p<0.65 ? "En route • NH" : "Near destination", updatedAt: new Date().toISOString() });
  }
  return NextResponse.json({ live: Array.from(store.values()) });
}

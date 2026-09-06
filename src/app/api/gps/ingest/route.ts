import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// In-memory live store (no DB needed for demo - works without paid subscription)
// When Supabase env is set, you can extend to push there
const g = globalThis as any;
if (!g.__LIVE_VEHICLES__) g.__LIVE_VEHICLES__ = new Map();
const store: Map<string, any> = g.__LIVE_VEHICLES__;

// 5 NER corridors — 20 pts each for smooth real road (interpolated, no teleport)
const ROUTES: Record<string, [number,number][]> = {
  "NER-1024": [[26.1445,91.736],[26.11,91.85],[26.08,91.95],[26.01,92.10],[25.95,92.25],[25.91,92.42],[25.88,92.60],[25.82,92.88],[25.77,93.17],[25.66,93.26],[25.55,93.35],[25.42,93.20],[25.30,93.05],[25.17,92.96],[25.05,92.88],[24.95,92.84],[24.83,92.80],[24.78,92.82],[24.70,92.85],[24.62,92.88]],
  "NER-1025": [[27.48,94.91],[27.50,94.95],[27.52,94.99],[27.55,95.02],[27.58,95.07],[27.60,95.11],[27.62,95.15],[27.65,95.20],[27.68,95.28],[27.66,95.31],[27.62,95.34],[27.58,95.37],[27.52,95.38],[27.49,95.37],[27.45,95.35],[27.42,95.32],[27.40,95.28],[27.38,95.22],[27.36,95.15],[27.34,95.08]],
  "NER-1026": [[26.75,94.21],[26.71,94.24],[26.68,94.28],[26.62,94.31],[26.55,94.35],[26.48,94.38],[26.42,94.42],[26.36,94.46],[26.32,94.52],[26.28,94.58],[26.24,94.64],[26.20,94.70],[26.16,94.76],[26.12,94.82],[26.08,94.88],[26.04,94.94],[26.00,95.00],[25.96,95.06],[25.92,95.12],[25.88,95.18]],
  "NER-1027": [[26.63,92.80],[26.68,92.90],[26.73,93.00],[26.77,93.10],[26.82,93.20],[26.86,93.27],[26.90,93.34],[26.95,93.41],[27.00,93.48],[27.03,93.55],[27.06,93.60],[27.08,93.62],[27.10,93.64],[27.12,93.66],[27.14,93.68],[27.16,93.70],[27.18,93.72],[27.20,93.74],[27.22,93.76],[27.24,93.78]],
  "NER-1028": [[26.20,92.90],[26.08,92.84],[25.95,92.75],[25.80,92.65],[25.65,92.55],[25.50,92.45],[25.35,92.35],[25.20,92.25],[25.05,92.15],[24.90,92.05],[24.75,91.95],[24.60,91.85],[24.45,91.70],[24.30,91.55],[24.15,91.40],[23.98,91.35],[23.83,91.28],[23.70,91.20],[23.58,91.12],[23.45,91.05]],
};
// per-vehicle progress 0..1, persisted in global so no reset on reload
const pg: Map<string, number> = (g.__GPS_PROGRESS__ ??= new Map());
const pgDir: Map<string, number> = (g.__GPS_DIR__ ??= new Map());
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
  pgDir.set("NER-1024",1);pgDir.set("NER-1025",1);pgDir.set("NER-1026",1);pgDir.set("NER-1027",1);pgDir.set("NER-1028",1);
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
  // time-based 40km/h (not per-request count) — smooth, no teleport even with many pollers
  const nowMs = Date.now();
  const lastTick = (g.__GPS_LAST_TICK__ ??= nowMs);
  const elapsedSec = Math.min(10, (nowMs - lastTick) / 1000); // cap 10s
  g.__GPS_LAST_TICK__ = nowMs;
  const delta = elapsedSec * 0.0028; // 0.007 per 2.5s = 0.0028 per sec ≈ 40km/h
  for(const [id, v] of store.entries()){
    const route = ROUTES[id]; if(!route) continue;
    const lastUpdate = new Date(v.updatedAt).getTime();
    if(nowMs - lastUpdate < 30000 && v._real) continue;
    let p = pg.get(id) ?? 0; let dir = pgDir.get(id) ?? 1;
    p += dir * delta;
    if(p>=0.99){ p=0.99; dir=-1; } else if(p<=0){ p=0; dir=1; }
    pg.set(id, p); pgDir.set(id, dir);
    const [lat,lng]=posAt(route, p);
    // update store in place
    store.set(id, { ...v, lat, lng, currentLocation: p<0.3 ? route[0].join(",").slice(0,12) : p<0.65 ? "En route • NH" : "Near destination", updatedAt: new Date().toISOString() });
  }
  return NextResponse.json({ live: Array.from(store.values()) }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

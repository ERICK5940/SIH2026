import { NextRequest, NextResponse } from "next/server";

// In-memory live store (no DB needed for demo - works without paid subscription)
// When Supabase env is set, you can extend to push there
const g = globalThis as any;
if (!g.__LIVE_VEHICLES__) g.__LIVE_VEHICLES__ = new Map();
const store: Map<string, any> = g.__LIVE_VEHICLES__;

// Seed
if (store.size === 0) {
  const now = new Date().toISOString();
  store.set("NER-1024", { id: "NER-1024", lat: 26.5, lng: 92.9, cargo: "medicines", currentLocation: "Assam", updatedAt: now });
  store.set("NER-1025", { id: "NER-1025", lat: 27.48, lng: 94.91, cargo: "food", currentLocation: "Arunachal Pradesh", updatedAt: now });
  store.set("NER-1026", { id: "NER-1026", lat: 26.14, lng: 91.73, cargo: "construction", currentLocation: "Guwahati", updatedAt: now });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, lat, lng, cargo, currentLocation } = body;
    if (!id || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "id, lat, lng required" }, { status: 400 });
    }
    store.set(id, { id, lat, lng, cargo, currentLocation: currentLocation || `${lat.toFixed(4)},${lng.toFixed(4)}`, updatedAt: new Date().toISOString() });
    return NextResponse.json({ ok: true, live: Array.from(store.values()) });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ live: Array.from(store.values()) });
}

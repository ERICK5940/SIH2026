import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const g = globalThis as any;
if (!g.__REROUTES__) g.__REROUTES__ = new Map();
if (!g.__NOTIFICATIONS__) g.__NOTIFICATIONS__ = [];

export async function POST(req: NextRequest) {
  try {
    const { vehicleId, from, to, reason } = await req.json();
    if (!vehicleId || !to) return NextResponse.json({ error: "vehicleId, to required" }, { status: 400 });
    
    const reroute = {
      vehicleId, from, to, reason: reason || "AI risk CRITICAL",
      status: "pending", // pending -> driver accepted
      createdAt: new Date().toISOString(),
      notifiedAt: new Date().toISOString(),
    };
    g.__REROUTES__.set(vehicleId, reroute);
    
    // Simulate driver notification (FCM + in-app + SMS fallback) - dedupe any pending for same vehicle
    g.__NOTIFICATIONS__ = (g.__NOTIFICATIONS__ as any[]).filter((n: any) => n.vehicleId !== vehicleId);
    const notification = {
      id: Date.now().toString(),
      vehicleId,
      from, to,
      title: `🔔 Reroute: ${from} → ${to}`,
      body: `${from} blocked (${reason}). Take ${to} — tap to navigate.`,
      lang: "en",
      channel: "PWA push + in-app banner (SMS fallback if offline)",
      timestamp: new Date().toISOString(),
    };
    g.__NOTIFICATIONS__.unshift(notification);
    
    // Update live vehicle status to rerouted (for VehicleTracking + GISMap)
    if (!g.__LIVE_VEHICLES__) g.__LIVE_VEHICLES__ = new Map();
    const v = g.__LIVE_VEHICLES__.get(vehicleId);
    if (v) {
      v.status = "rerouted";
      v.assignedRoute = to;
      g.__LIVE_VEHICLES__.set(vehicleId, v);
    }

    return NextResponse.json({ ok: true, reroute, notification });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ reroutes: Array.from((g.__REROUTES__ as Map<string, any>).values()), notifications: g.__NOTIFICATIONS__ }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

// Driver accepts - removes inbox notification so no repeat
export async function PATCH(req: NextRequest) {
  try {
    const { vehicleId } = await req.json();
    const r = (g.__REROUTES__ as Map<string, any>).get(vehicleId);
    if (r) {
      r.status = "accepted";
      r.acceptedAt = new Date().toISOString();
      (g.__REROUTES__ as Map<string, any>).set(vehicleId, r);
    }
    // remove driver inbox entries for this vehicle
    g.__NOTIFICATIONS__ = (g.__NOTIFICATIONS__ as any[]).filter((n: any) => n.vehicleId !== vehicleId);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

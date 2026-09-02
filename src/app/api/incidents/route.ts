import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const g = globalThis as any;
if (!g.__INCIDENTS__) g.__INCIDENTS__ = [
  { id: "1", type: "landslide", description: "Major landslide reported on NH-37", severity: "high", accessibilityStatus: "blocked", timestamp: "2026-08-26T09:17:00.000Z", location: { latitude: 26.2, longitude: 92.9 }, offline: false },
  { id: "2", type: "flood", description: "Heavy rainfall causing flooding in lower Assam", severity: "medium", accessibilityStatus: "delayed", timestamp: "2026-08-26T08:49:00.000Z", location: { latitude: 26.1, longitude: 91.7 }, offline: false },
];

export async function GET() {
  // Try Supabase first if env set — else fallback to in-memory (handles Vercel serverless restart)
  try {
    const supa = await getSupabase();
    if (supa) {
      const { data, error } = await supa.from("incidents").select("*").order("created_at", { ascending: false }).limit(50);
      if (!error && data) {
        const mapped = data.map((r:any)=> ({ id:r.id, type:r.type, description:r.description, severity:r.severity, accessibilityStatus:r.accessibility_status, location:{latitude:r.lat, longitude:r.lng}, photoUrl:r.photo_url, timestamp:r.created_at, state:r.state, district:r.district, road:r.road, offline:!!r.offline, authority:r.authority, role:r.role }));
        return NextResponse.json({ incidents: mapped }, { headers: { "Cache-Control": "no-store, max-age=0" } });
      }
    }
  } catch {}
  return NextResponse.json({ incidents: g.__INCIDENTS__ }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const incident = {
      id: Date.now().toString(),
      ...body,
      timestamp: new Date().toISOString(),
    };
    // Try Supabase first — retry without extra cols if schema old
    try {
      const supa = await getSupabase();
      if (supa) {
        let { error } = await supa.from("incidents").insert({ id: incident.id, type: incident.type, description: incident.description, severity: incident.severity, accessibility_status: incident.accessibilityStatus, lat: incident.location?.latitude, lng: incident.location?.longitude, photo_url: incident.photoUrl, offline: !!incident.offline, state: incident.state, district: incident.district, road: incident.road, authority: incident.authority, role: incident.role });
        if (error) {
          const retry = await supa.from("incidents").insert({ id: incident.id, type: incident.type, description: incident.description, severity: incident.severity, accessibility_status: incident.accessibilityStatus, lat: incident.location?.latitude, lng: incident.location?.longitude, photo_url: incident.photoUrl, offline: !!incident.offline });
          if (!retry.error) return NextResponse.json({ ok: true, incident });
        } else return NextResponse.json({ ok: true, incident });
      }
    } catch {}
    g.__INCIDENTS__.unshift(incident);
    return NextResponse.json({ ok: true, incident });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export const revalidate = 0;
const g = globalThis as any;
if (!g.__INCIDENTS__) g.__INCIDENTS__ = [
  { id: "1", type: "landslide", description: "Major landslide reported on NH-37", severity: "high", accessibilityStatus: "blocked", timestamp: "2026-08-26T09:17:00.000Z", location: { latitude: 26.2, longitude: 92.9 }, offline: false },
  { id: "2", type: "flood", description: "Heavy rainfall causing flooding in lower Assam", severity: "medium", accessibilityStatus: "delayed", timestamp: "2026-08-26T08:49:00.000Z", location: { latitude: 26.1, longitude: 91.7 }, offline: false },
];

export async function GET() {
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
    g.__INCIDENTS__.unshift(incident);
    return NextResponse.json({ ok: true, incident });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
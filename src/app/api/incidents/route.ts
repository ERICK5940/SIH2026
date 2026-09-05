import { NextRequest, NextResponse } from "next/server";
import { getSupabase, SUPABASE_ENABLED } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Map DB row (snake_case) -> API shape (camelCase) — used by GET
function mapRow(r: any) {
  return {
    id: r.id,
    type: r.type,
    description: r.description,
    severity: r.severity,
    accessibilityStatus: r.accessibility_status,
    location: { latitude: r.lat, longitude: r.lng },
    photoUrl: r.photo_url,
    timestamp: r.created_at,
    state: r.state,
    district: r.district,
    road: r.road,
    authority: r.authority,
    role: r.role,
    lifecycle: r.lifecycle ?? "reported",
    offline: !!r.offline,
  };
}

export async function GET() {
  if (!SUPABASE_ENABLED) {
    console.error("Supabase not configured: NEXT_PUBLIC_SUPABASE_URL / ANON_KEY missing");
    return NextResponse.json(
      { error: "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." },
      { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
  try {
    const supa = await getSupabase();
    if (!supa) throw new Error("getSupabase() returned null");
    const { data, error } = await supa
      .from("incidents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("Supabase incidents SELECT failed:", error);
      return NextResponse.json({ error: "Failed to fetch incidents", details: error.message }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } });
    }
    const incidents = (data ?? []).map(mapRow);
    return NextResponse.json({ incidents }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (e: any) {
    console.error("Unexpected GET /api/incidents error:", e);
    return NextResponse.json({ error: "Unexpected server error", details: e?.message }, { status: 500, headers: { "Cache-Control": "no-store, max-age=0" } });
  }
}

export async function POST(req: NextRequest) {
  if (!SUPABASE_ENABLED) {
    console.error("POST /api/incidents without Supabase config");
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 1. Validate payload
  if (!body?.type || !body?.description || !body?.severity || !body?.accessibilityStatus || !body?.location?.latitude || !body?.location?.longitude) {
    return NextResponse.json({ error: "Missing required fields: type, description, severity, accessibilityStatus, location" }, { status: 400 });
  }
  const allowedSev = ["low", "medium", "high"];
  const allowedAccess = ["accessible", "delayed", "high_risk", "blocked"];
  if (!allowedSev.includes(body.severity) || !allowedAccess.includes(body.accessibilityStatus)) {
    return NextResponse.json({ error: "Invalid severity or accessibilityStatus" }, { status: 400 });
  }

  // 2. Stable ID — client sends Date.now() id, trust it for idempotency, fallback to server-generated
  const id = typeof body.id === "string" && body.id.trim().length > 0 ? body.id.trim() : Date.now().toString();
  const incidentRow = {
    id,
    type: body.type,
    description: body.description,
    severity: body.severity,
    accessibility_status: body.accessibilityStatus,
    lat: body.location.latitude,
    lng: body.location.longitude,
    photo_url: body.photoUrl ?? null,
    offline: !!body.offline,
    state: body.state ?? null,
    district: body.district ?? null,
    road: body.road ?? null,
    authority: body.authority ?? null,
    role: body.role ?? null,
    lifecycle: body.lifecycle ?? "reported",
  };

  try {
    const supa = await getSupabase();
    if (!supa) throw new Error("getSupabase null");
    // 3-5. Idempotent upsert on PK id — prevents duplicates from IndexedDB retry / refresh
    const { data, error } = await supa
      .from("incidents")
      .upsert(incidentRow, { onConflict: "id" })
      .select("*")
      .single();
    if (error) {
      console.error("Supabase incident upsert failed:", error);
      return NextResponse.json({ error: "Failed to persist incident", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, incident: mapRow(data) });
  } catch (e: any) {
    console.error("Unexpected POST /api/incidents error:", e);
    return NextResponse.json({ error: "Unexpected server error", details: e?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!SUPABASE_ENABLED) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, lifecycle } = body ?? {};
  const allowed = ["reported", "verified", "assigned", "response", "resolved"];
  if (!id || !lifecycle || !allowed.includes(lifecycle)) {
    return NextResponse.json({ error: "Missing id or invalid lifecycle" }, { status: 400 });
  }
  try {
    const supa = await getSupabase();
    if (!supa) throw new Error("getSupabase null");
    const { data, error } = await supa.from("incidents").update({ lifecycle }).eq("id", id).select("*").single();
    if (error) {
      console.error("Supabase incident PATCH failed:", error);
      return NextResponse.json({ error: "Failed to update lifecycle", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, incident: data ? mapRow(data) : null });
  } catch (e: any) {
    console.error("Unexpected PATCH error:", e);
    return NextResponse.json({ error: "Unexpected server error", details: e?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!SUPABASE_ENABLED) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const supa = await getSupabase();
    if (!supa) throw new Error("getSupabase null");
    // Archive: fetch then insert into dataset file is not possible on Vercel read-only, so just delete (consider archived)
    const { error } = await supa.from("incidents").delete().eq("id", id);
    if (error) {
      console.error("Supabase delete failed:", error);
      return NextResponse.json({ error: "Failed to delete", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE error", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

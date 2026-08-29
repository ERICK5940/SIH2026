// Supabase FREE tier - live sync skeleton
// Fill NEXT_PUBLIC_SUPABASE_URL / ANON_KEY in .env to go live - falls back to sample data for demo
export const SUPABASE_ENABLED = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Lazy client - only created when env is present (avoids build errors on demo)
export async function getSupabase() {
  if (!SUPABASE_ENABLED) return null;
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

// Realtime helpers - used by VehicleTracking / GISMap / IncidentReporting
export type RealtimeVehicle = {
  id: string; cargo: string; currentLocation: string; destination: string;
  etaMinutes: number; delayMinutes: number; status: string; accessibility: number; lastUpdate: string;
};

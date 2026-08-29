// In-memory live store (fallback when Supabase env not set) - FREE, no DB needed for demo
// When SUPABASE_ENABLED, data goes to Supabase; otherwise lives in memory via API

export type LiveVehicle = {
  id: string;
  lat: number;
  lng: number;
  cargo?: string;
  currentLocation?: string;
  dest?: string;
  speedKph?: number;
  updatedAt: string;
};

const g = globalThis as any;
if (!g.__LIVE_VEHICLES__) g.__LIVE_VEHICLES__ = new Map<string, LiveVehicle>();

export function getStore(): Map<string, LiveVehicle> {
  return g.__LIVE_VEHICLES__ as Map<string, LiveVehicle>;
}

export function upsertLive(v: LiveVehicle) {
  getStore().set(v.id, { ...v, updatedAt: new Date().toISOString() });
}

export function getAllLive(): LiveVehicle[] {
  return Array.from(getStore().values());
}

// Seed 3 vehicles on first load (simulated movement along NH-37/52)
if (getStore().size === 0) {
  upsertLive({ id: "NER-1024", lat: 26.5, lng: 92.9, cargo: "medicines", currentLocation: "Assam", updatedAt: new Date().toISOString() });
  upsertLive({ id: "NER-1025", lat: 27.48, lng: 94.91, cargo: "food", currentLocation: "Arunachal Pradesh", updatedAt: new Date().toISOString() });
  upsertLive({ id: "NER-1026", lat: 26.14, lng: 91.73, cargo: "construction", currentLocation: "Guwahati", updatedAt: new Date().toISOString() });
}

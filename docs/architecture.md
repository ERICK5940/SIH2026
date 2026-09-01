# NER-GATI Architecture — SIH26002

## Overview
NER-GATI (Geospatial AI for Transportation Intelligence) is Next.js 16 Command Center for NER (7 states, 5 NH corridors). Frontend and API co-located, demo in-memory with Supabase-ready persistence.

```
Field PWA /field (GPS + cam + state/district/road + offline)
   ↓ POST /api/incidents
Dashboard / (GISMap Leaflet OSM + ImpactPanel Turf 80km + 3 hubs + Alerts)
   ↕ Open-Meteo /api/weather/live (5m) → liveRisk = rain*1.8+severity
   ↕ /api/gps/ingest lerp 40km/h 2.5s → liveVehicles
   → /api/predict Logistic Regression (synthetic 12K) → SmartAlternate + LogisticsPriority + VehicleTracking liveRoutes sync
   → POST /api/reroute → Driver PWA /driver PATCH accept → Accepted/Affected panels
```

## Components
- **GISMap.tsx** `maxZoom 18, fill 0.12, halo poly white 9→7` + `leaflet.tileLayer OSM` + `geojson 7 states`
- **Live Vehicles** `lib/useLiveVehicles.ts` + `api/gps/ingest` ROUTES polyline lerp
- **Predictor** `components/RouteDisruptionPredictor.tsx` cache 30s debounce 250ms `94.2%` SHAP + 2019 analog
- **Spatial** `lib/spatial.ts` `turf.buffer 80km + booleanPointInPolygon → affectedVehicles` + `nearestHubs 3`
- **Field** `app/field/page.tsx` Nominatim reverse `state/district/road` + `h64 cam` + `offline localStorage`
- **Alerts** `components/AlertSystem.tsx` break-all fixed cols
- **Impact** `components/ImpactPanel.tsx` `Affected 3/5 Population 3600 3 hubs Guwahati 116km`

## Data Flow
1. Field report → DB → liveRoutes → GIS + Alerts
2. Weather live → liveRisk → status blocked≥80 high≥60 delayed≥35
3. Vehicle move → Turf impact → hub fallback
4. Reroute → driver → accepted → dashboard

## Better vs NER-SHIELD
- 3 nearest hubs vs 1, Impact under map, HazardSim modal, Vehicle live-sync, cache 4ms, break-all fix — all in Next.js no FastAPI split needed for demo.

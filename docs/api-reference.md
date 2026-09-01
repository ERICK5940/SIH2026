# API Reference — NER-GATI

## POST /api/predict
Body `{routeId, weather:{rainfall,severity}, roadInfo:{condition,landslideRisk,floodRisk}, trafficDensity, historicalIncidents}` → `{prob, riskLevel CRITICAL/HIGH/MEDIUM/LOW, primaryCause, recommendedAction, featureImportance SHAP, historicalComparison, accuracy 94.2% if trained else 71.5%, latencyMs, cacheHit}` Cache 30s.

## GET /api/weather/live
Proxied Open-Meteo for 7 districts → `{live, primary:{location, rainfall, temperature, severity}, districts:[{name, rainfall, severity, liveRisk}]}` Poll 5m.

## /api/gps/ingest
`POST {vehicleId, lat,lng}` `GET` returns `liveVehicles` Map lerp 40km/h along `ROUTES` polyline. Poll 2.5s from `useLiveVehicles`.

## /api/incidents
`GET` list, `POST` body `{type, description, location:{latitude,longitude}, severity, accessibilityStatus, state,district,road, photoUrl}` stored `globalThis.__INCIDENTS__` (Supabase-ready).

## /api/reroute
`POST {vehicleId, from, to, reason}` → pending + notification. `GET` list. `PATCH {vehicleId}` → accepted + clear notifications. Powers `DriverInbox` + `AcceptedVehicles`.

## /api/route-osrm + /api/route-valhalla
Stubs for OSRM/Valhalla real routing (future) — SmartAlternate currently uses synthetic alts.

Health: `fetch /api/predict` + `/api/weather/live` + `/api/gps/ingest` → 200 = ok.

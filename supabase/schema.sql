-- SUPABASE FREE - NER Logistics Intelligence Schema (PostGIS)
-- Run in Supabase SQL editor. No paid sub required (500MB free).
create extension if not exists postgis;

-- Routes with geo line
create table if not exists routes (
  id text primary key,
  name text not null,
  from_district text, to_district text,
  status text check (status in ('accessible','delayed','high_risk','blocked','emergency')),
  distance_km int, eta text, risk_score int,
  geom geometry(LineString,4326),
  updated_at timestamp with time zone default now()
);

-- District accessibility (materialized score)
create table if not exists districts (
  name text primary key,
  roads int, weather_risk int, disruptions int, connectivity int, emergency_access int,
  accessibility_score int generated always as (least(100,greatest(0, round(roads*0.3 + (100-weather_risk)*0.2 + (100-disruptions)*0.2 + connectivity*0.15 + emergency_access*0.15)))) stored,
  geom geometry(MultiPolygon,4326),
  updated_at timestamp with time zone default now()
);

-- Vehicles live GPS (realtime)
create table if not exists vehicles (
  id text primary key,
  cargo text, destination text, current_location text,
  eta_minutes int, delay_minutes int, status text, accessibility int,
  geom geometry(Point,4326),
  population_affected int,
  last_update timestamp with time zone default now()
);

-- Incidents field reports
create table if not exists incidents (
  id text primary key,
  type text, description text, severity text, accessibility_status text,
  lat double precision, lng double precision,
  geom geometry(Point,4326) generated always as (ST_SetSRID(ST_MakePoint(lng,lat),4326)) stored,
  photo_url text, offline boolean default false,
  state text, district text, road text, authority text, role text,
  lifecycle text default 'reported',
  created_at timestamp with time zone default now()
);
-- Backward-compat for DBs created before 2026-09-03 schema update:
alter table incidents add column if not exists photo_url text;
alter table incidents add column if not exists offline boolean default false;
alter table incidents add column if not exists state text;
alter table incidents add column if not exists district text;
alter table incidents add column if not exists road text;
alter table incidents add column if not exists authority text;
alter table incidents add column if not exists role text;
alter table incidents add column if not exists lifecycle text default 'reported';

-- Enable Realtime (Supabase free includes it)
-- In Supabase dashboard: Database -> Realtime -> enable for vehicles, incidents, routes

-- Example RLS (open for prototype - lock down for prod)
alter table routes enable row level security;
alter table vehicles enable row level security;
alter table incidents enable row level security;
drop policy if exists "open" on routes; create policy "open" on routes for all using (true) with check (true);
drop policy if exists "open" on vehicles; create policy "open" on vehicles for all using (true) with check (true);
drop policy if exists "open" on incidents; create policy "open" on incidents for all using (true) with check (true);

-- Seed NER (run once)
insert into districts(name,roads,weather_risk,disruptions,connectivity,emergency_access) values
('Assam',75,30,20,70,65),('Arunachal Pradesh',45,50,35,40,30),('Meghalaya',60,25,15,65,55),
('Mizoram',50,40,25,50,45),('Nagaland',55,35,20,55,50),('Tripura',70,20,10,75,60),('Manipur',65,30,18,60,55)
on conflict do nothing;

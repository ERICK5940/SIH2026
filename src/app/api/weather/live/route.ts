import { NextResponse } from "next/server";

// FREE - no API key, no paid sub - Open-Meteo
function codeToSeverity(code: number): "clear" | "cloudy" | "rain" | "storm" {
  if (code === 0 || code === 1) return "clear";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  if ([95, 96, 99].includes(code)) return "storm";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 85, 86].includes(code)) return "rain";
  return "cloudy";
}

// NER 7 districts - real coords
const NER_POINTS = [
  { name: "Guwahati/Assam", lat: 26.1445, lon: 91.7362 },
  { name: "Itanagar/Arunachal", lat: 27.0844, lon: 93.6053 },
  { name: "Shillong/Meghalaya", lat: 25.5788, lon: 91.8933 },
  { name: "Imphal/Manipur", lat: 24.817, lon: 93.9368 },
  { name: "Kohima/Nagaland", lat: 25.6751, lon: 94.1086 },
  { name: "Aizawl/Mizoram", lat: 23.7307, lon: 92.7173 },
  { name: "Agartala/Tripura", lat: 23.8315, lon: 91.2868 },
];

export async function GET(request: Request) {
  // Cache busting - use request URL with timestamp to force fresh fetch
  const { searchParams } = new URL(request.url);
  const _cacheBust = searchParams.get('t'); // ignored, just for cache busting
  
  try {
    // Fetch all 7 NER points concurrently
    const fetches = NER_POINTS.map(async (p) => {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lon}&current=temperature_2m,precipitation,weather_code,wind_speed_10m&daily=precipitation_sum&timezone=Asia%2FKolkata&forecast_days=1`;
      const r = await fetch(url, { 
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store' // Force fresh fetch every time
      });
      if (!r.ok) throw new Error(`weather ${p.name} ${r.status}`);
      const j = await r.json();
      return {
        name: p.name,
        lat: p.lat, lon: p.lon,
        temp: j.current?.temperature_2m ?? 28,
        rainfall: j.current?.precipitation ?? j.daily?.precipitation_sum?.[0] ?? 0,
        code: j.current?.weather_code ?? 3,
        wind: j.current?.wind_speed_10m ?? 0,
      };
    });

    const results = await Promise.all(fetches);
    const guw = results.find(r => r.name.includes("Guwahati")) || results[0];
    const avgRain = results.reduce((s, r) => s + (r.rainfall || 0), 0) / results.length;
    const maxCode = Math.max(...results.map(r => r.code));
    const severity = codeToSeverity(guw.code);

    return NextResponse.json({
      live: true,
      timestamp: new Date().toISOString(),
      source: "open-meteo free (no key) • live fetch",
      primary: {
        location: guw.name,
        severity,
        rainfall: Math.round(guw.rainfall * 10) / 10,
        temperature: Math.round(guw.temp),
        wind: guw.wind,
        code: guw.code,
      },
      nerAvg: {
        rainfall: Math.round(avgRain * 10) / 10,
        maxSeverity: codeToSeverity(maxCode),
      },
      districts: results.map(r => ({
        name: r.name, severity: codeToSeverity(r.code), rainfall: r.rainfall, temp: r.temp, code: r.code,
      })),
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (e: any) {
    return NextResponse.json({ live: false, error: e.message, fallback: { severity: "rain", rainfall: 45, temperature: 28 } }, { 
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  }
}

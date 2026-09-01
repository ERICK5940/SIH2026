// run: node tests/health_check.js  (needs dev server on 3000)
const base = process.env.BASE || "http://localhost:3000";
async function check(p, opts){ const r=await fetch(base+p, opts); const j=await r.json().catch(()=>({})); console.log(p, r.status, j.latencyMs||j.live!==undefined? "ok":""); if(!r.ok) throw new Error(p+" failed"); return j; }
(async()=>{
  await check("/api/weather/live");
  await check("/api/predict",{method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({routeId:"NH-37", weather:{rainfall:45, severity:"rain", temperature:28}, roadInfo:{condition:"fair", landslideRisk:true}, trafficDensity:75, historicalIncidents:[]})});
  await check("/api/gps/ingest");
  console.log("health ok");
})().catch(e=>{ console.error(e); process.exit(1); });

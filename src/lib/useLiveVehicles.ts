"use client";

import { useEffect, useState } from "react";

export function useLiveVehicles(pollMs = 2500) {
  const [live, setLive] = useState<Record<string, any>>({});
  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      try {
        const r = await fetch("/api/gps/ingest");
        const j = await r.json();
        if (cancelled) return;
        const m: Record<string, any> = {};
        (j.live || []).forEach((v: any) => (m[v.id] = v));
        setLive(m);
      } catch {}
    };
    poll();
    const id = setInterval(poll, pollMs);
    return () => { cancelled = true; clearInterval(id); };
  }, [pollMs]);
  return live;
}

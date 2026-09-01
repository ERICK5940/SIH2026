"use client";
const DB_NAME = "ner-offline";
const STORE = "reports";
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function queueReport(report: any) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(report);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function getQueued(): Promise<any[]> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => res(req.result || []);
    req.onerror = () => rej(req.error);
  });
}

export async function clearQueued(ids: string[]) {
  const db = await openDB();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    ids.forEach(id => store.delete(id));
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

export async function syncQueued(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const queued = await getQueued();
  if (!queued.length) return 0;
  const okIds: string[] = [];
  for (const r of queued) {
    try {
      const resp = await fetch("/api/incidents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
      if (resp.ok) okIds.push(r.id);
    } catch {}
  }
  if (okIds.length) await clearQueued(okIds);
  // also migrate legacy localStorage if present
  try {
    const legacy = JSON.parse(localStorage.getItem("offline-reports") || "[]");
    if (legacy.length) {
      for (const r of legacy) await queueReport(r);
      localStorage.removeItem("offline-reports");
    }
  } catch {}
  return okIds.length;
}

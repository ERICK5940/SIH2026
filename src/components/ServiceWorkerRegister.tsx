"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // avoid double register in HMR
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        // console.log("SW registered");
      })
      .catch(() => {
        // silent fail - offline skeleton only
      });
  }, []);
  return null;
}

export default ServiceWorkerRegister;

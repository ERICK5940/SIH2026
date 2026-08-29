import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NER Command Center - Logistics Intelligence",
    short_name: "NER Command",
    description:
      "NER Logistics Intelligence Command Center - Real-time monitoring for North Eastern Region",
    startUrl: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    backgroundColor: "#0f172a",
    themeColor: "#0f172a",
    icons: [
      {
        src: "/file.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/globe.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/vercel.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/window.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}

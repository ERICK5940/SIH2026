export interface Hub { id: string; name: string; district: string; lat: number; lng: number; stock: Record<string, number>; }
export const HUBS: Hub[] = [
  { id: "hub-ghy", name: "Guwahati Hub", district: "Assam", lat: 26.1445, lng: 91.7362, stock: { medicines: 120, food: 800, construction: 400 } },
  { id: "hub-ita", name: "Itanagar Hub", district: "Arunachal Pradesh", lat: 27.0844, lng: 93.6053, stock: { medicines: 60, food: 300, construction: 200 } },
  { id: "hub-dib", name: "Dibrugarh Hub", district: "Arunachal Pradesh", lat: 27.48, lng: 94.91, stock: { medicines: 80, food: 500, construction: 300 } },
  { id: "hub-shi", name: "Shillong Hub", district: "Meghalaya", lat: 25.5788, lng: 91.8933, stock: { medicines: 70, food: 400, construction: 250 } },
  { id: "hub-koh", name: "Kohima Hub", district: "Nagaland", lat: 25.6747, lng: 94.11, stock: { medicines: 50, food: 350, construction: 180 } },
  { id: "hub-imp", name: "Imphal Hub", district: "Manipur", lat: 24.817, lng: 93.9368, stock: { medicines: 55, food: 320, construction: 200 } },
  { id: "hub-aga", name: "Agartala Hub", district: "Tripura", lat: 23.8315, lng: 91.2868, stock: { medicines: 65, food: 450, construction: 220 } },
];

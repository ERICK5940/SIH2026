export interface Bridge { id: string; name: string; lat: number; lng: number; status: "accessible"|"delayed"|"blocked"; span: string; }
export const BRIDGES: Bridge[] = [
  { id: "b1", name: "Bogibeel Bridge (Brahmaputra)", lat: 27.475, lng: 94.84, status: "accessible", span: "4.94km" },
  { id: "b2", name: "Dhola-Sadiya Bridge", lat: 27.84, lng: 95.62, status: "delayed", span: "9.15km" },
  { id: "b3", name: "Saraighat Bridge", lat: 26.172, lng: 91.67, status: "accessible", span: "1.49km" },
  { id: "b4", name: "Kolia Bhomora Setu", lat: 26.63, lng: 92.86, status: "blocked", span: "3.01km" },
];

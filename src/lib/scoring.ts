export type DistrictData = { roads: number; weatherRisk: number; disruptions: number; connectivity: number; emergencyAccess: number };

export function calcDistrictScore(d: DistrictData, liveRisk?: number) {
  const wr = liveRisk ?? d.weatherRisk;
  return Math.round((d.roads * 0.3) + ((100 - wr) * 0.2) + ((100 - d.disruptions) * 0.2) + (d.connectivity * 0.15) + (d.emergencyAccess * 0.15));
}

export function getGrade(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Good", color: "#10b981" };
  if (score >= 60) return { label: "Moderate", color: "#f59e0b" };
  if (score >= 40) return { label: "Poor", color: "#f97316" };
  return { label: "Critical", color: "#ef4444" };
}

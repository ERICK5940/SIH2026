"use client";

import React from "react";

interface DistrictData {
  id: string;
  name: string;
  accessibilityScore: number;
  roads: number;
  weatherRisk: number;
  disruptions: number;
  connectivity: number;
  emergencyAccess: number;
}

interface DistrictScoreCardProps {
  district: DistrictData;
}

const gradeThresholds = [
  { min: 80, label: "Good", color: "#10b981" },
  { min: 60, label: "Moderate", color: "#f59e0b" },
  { min: 40, label: "Poor", color: "#f97316" },
  { min: 0, label: "Critical", color: "#ef4444" },
];

function getGrade(score: number) {
  for (const { min, label, color } of gradeThresholds) {
    if (score >= min) return { label, color };
  }
  return { label: "Critical", color: "#ef4444" };
}

export function DistrictScoreCard({ district }: DistrictScoreCardProps) {
  const { label: grade, color } = getGrade(district.accessibilityScore);

  return (
    <div className="group border rounded-lg p-6 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{district.name}</h3>
          <p className="text-zinc-500 text-sm">District Accessibility Score</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold">{district.accessibilityScore}</p>
          <p className="text-sm text-{color}/80">{grade}</p>
        </div>
      </div>
      <div className="mt-4 h-2 bg-zinc-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-{color} to-emerald-600 transition-all duration-500"
          style={{ width: `${district.accessibilityScore}%` }}
        ></div>
      </div>
      <div className="mt-3 text-xs flex space-x-2">
        {[60, 40, 20].map((threshold) => (
          <span
            key={threshold}
            className={`px-2 py-0.5 rounded text-[10px] ${district.accessibilityScore >= threshold ? color : 'zinc-300'}`}
          >
            {threshold}+
          </span>
        ))}
      </div>
    </div>
  );
}

export function DistrictAccessibilityDashboard({
  districts,
}: {
  districts: Record<string, DistrictData>;
}) {
  const scoredDistricts = React.useMemo(
    () => Object.entries(districts).map(([name, data]) => ({ name, ...data, accessibilityScore: undefined })),
    [districts]
  );

  // Calculate scores
  const scores = React.useMemo(() => {
    const result: Record<string, number> = {};
    Object.entries(districts).forEach(([name, data]) => {
      const score = (data.roads * 0.3) + ((100 - data.weatherRisk) * 0.2) + ((100 - data.disruptions) * 0.2) + (data.connectivity * 0.15) + (data.emergencyAccess * 0.15);
      result[name] = Math.max(0, Math.min(100, Math.round(score)));
    });
    return result;
  }, [districts]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">District Intelligence Dashboard</h2>
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(scores).map(([name, score]) => {
          const data = districts[name];
          if (!data) return null;
          const { label: grade, color } = getGrade(score);
          return (
            <div
              key={name}
              className="group border rounded-lg p-6 bg-white shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">{name}</h3>
                  <p className="text-zinc-500 text-sm">District Accessibility</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{score}</p>
                  <p className="text-sm" style={{ color }}>{grade}</p>
                </div>
              </div>
              <div className="mt-4 h-2 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${score}%`, backgroundColor: color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
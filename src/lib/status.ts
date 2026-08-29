export const statusColors: Record<string, string> = {
  accessible: "#10b981", delayed: "#f59e0b", high_risk: "#f97316", blocked: "#ef4444", emergency: "#0ea5e9",
};
export const statusLabels: Record<string, string> = {
  accessible: "🟢 Accessible", delayed: "🟡 Delayed", high_risk: "🟠 High Risk", blocked: "🔴 Blocked", emergency: "🔵 Emergency",
};
export const cargoBadge: Record<string, string> = {
  medicines: "bg-red-100 text-red-700 border-red-200", food: "bg-amber-100 text-amber-700 border-amber-200",
  agricultural: "bg-emerald-100 text-emerald-700 border-emerald-200", construction: "bg-orange-100 text-orange-700 border-orange-200", other: "bg-slate-100 text-slate-700 border-slate-200",
};

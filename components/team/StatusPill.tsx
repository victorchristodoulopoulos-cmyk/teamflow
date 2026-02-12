import React from "react";

export default function StatusPill({ status }: { status?: string | null }) {
  const s = (status ?? "").toLowerCase();

  const map =
    s === "inscrito" || s === "validado"
      ? "bg-emerald-400/15 text-emerald-200 border-emerald-400/20"
      : s === "pendiente"
      ? "bg-amber-400/15 text-amber-200 border-amber-400/20"
      : "bg-white/10 text-white/70 border-white/15";

  const label = status ?? "—";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${map}`}
    >
      {label}
    </span>
  );
}

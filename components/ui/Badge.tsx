import React from "react";

type Tone = "success" | "warning" | "danger" | "neutral";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  const map: Record<Tone, string> = {
    success: "bg-[rgba(var(--success),0.18)] border-[rgba(var(--success),0.28)] text-[rgb(var(--success))]",
    warning: "bg-[rgba(var(--warning),0.16)] border-[rgba(var(--warning),0.28)] text-[rgb(var(--warning))]",
    danger: "bg-[rgba(var(--danger),0.16)] border-[rgba(var(--danger),0.28)] text-[rgb(var(--danger))]",
    neutral: "bg-white/6 border-white/10 text-white/80",
  };

  return (
    <span className={["inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold", map[tone]].join(" ")}>
      {children}
    </span>
  );
}

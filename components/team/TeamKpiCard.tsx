import React from "react";

type Props = {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
};

export default function TeamKpiCard({ label, value, sub, right }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/55">
            {label}
          </p>
          <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
          {sub ? (
            <div className="mt-1 text-sm text-white/55">{sub}</div>
          ) : null}
        </div>
        {right ? <div className="pt-1">{right}</div> : null}
      </div>
    </div>
  );
}

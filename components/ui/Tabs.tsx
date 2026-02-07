import React from "react";

export function Tabs({
  value,
  onChange,
  items,
}: {
  value: string;
  onChange: (v: string) => void;
  items: Array<{ value: string; label: string; count?: number }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={[
              "inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-bold border transition outline-none focus-visible:tf-focus",
              active
                ? "bg-white/10 border-white/14 text-white"
                : "bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/8",
            ].join(" ")}
          >
            {it.label}
            {typeof it.count === "number" ? (
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-xs border border-white/10">
                {it.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

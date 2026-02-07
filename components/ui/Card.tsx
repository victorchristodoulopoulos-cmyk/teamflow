import React from "react";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={["tf-card", className].join(" ")}>{children}</div>;
}

export function CardHeader({
  className = "",
  title,
  subtitle,
  right,
}: {
  className?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className={["p-5 flex items-start justify-between gap-4", className].join(" ")}>
      <div className="min-w-0">
        {subtitle ? <div className="text-sm tf-muted">{subtitle}</div> : null}
        <div className="mt-1 text-xl font-extrabold tracking-tight text-[rgb(var(--text))]">{title}</div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardContent({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={["px-5 pb-5", className].join(" ")}>{children}</div>;
}

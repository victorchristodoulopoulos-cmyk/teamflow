import React from "react";

type Props = {
  teamName: string;
  torneoName?: string | null;
  city?: string | null;
  coachName?: string | null;
  coachEmail?: string | null;
  clubName?: string | null;
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/80">
      {children}
    </span>
  );
}

export default function TeamHeader({
  teamName,
  torneoName,
  city,
  coachName,
  coachEmail,
  clubName,
}: Props) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_30px_90px_-45px_rgba(0,0,0,0.8)] p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-white">{teamName}</h1>
          <p className="mt-2 text-sm text-white/60">
            Torneo:{" "}
            <span className="text-white/90 font-medium">
              {torneoName ?? "—"}
            </span>
            {city ? <span className="text-white/40"> · {city}</span> : null}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {coachName ? <Chip>{coachName}</Chip> : null}
          {clubName ? <Chip>{clubName}</Chip> : null}
          {coachEmail ? <Chip>{coachEmail}</Chip> : null}
        </div>
      </div>
    </div>
  );
}

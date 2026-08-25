"use client";

import { relativeFrom } from "@/lib/format";
import { ReactNode } from "react";

export function Panel({
  title,
  kicker,
  fetchedAt,
  children,
  className = "",
  live,
}: {
  title: string;
  kicker?: string;
  fetchedAt?: string | null;
  children: ReactNode;
  className?: string;
  live?: boolean;
}) {
  return (
    <section className={`glass relative overflow-hidden rounded-2xl p-4 ${className}`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="panel-title">{kicker ?? "module"}</div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-white">{title}</h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-white/45">
          {live ? (
            <span className="flex items-center gap-1 text-cyan-glow">
              <span className="inline-block h-1.5 w-1.5 animate-pulseDot rounded-full bg-cyan-glow" />
              live
            </span>
          ) : null}
          <span>upd {fetchedAt ? relativeFrom(fetchedAt) : "—"}</span>
        </div>
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-sm leading-relaxed text-white/55">
      {children}
    </div>
  );
}

export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  if (!values.length) return <span className="text-[10px] text-white/30">no spark</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 72;
  const h = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x},${y}`;
    })
    .join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`h-5 w-[72px] ${className}`} aria-hidden>
      <polyline fill="none" stroke={up ? "#3ee0c6" : "#ff6b7a"} strokeWidth="1.6" points={pts} />
    </svg>
  );
}

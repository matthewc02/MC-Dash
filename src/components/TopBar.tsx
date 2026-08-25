"use client";

import { APP_NAME, COMMAND_DATE_LABEL, TZ } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { useEffect, useState } from "react";

function Clock({ zone, label }: { zone: string; label: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const t = now
    ? new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now)
    : "—:—:—";
  return (
    <div className="min-w-[92px] text-right">
      <div className="panel-title">{label}</div>
      <div className="font-mono text-sm text-white/90 tabular-nums">{t}</div>
    </div>
  );
}

export default function TopBar() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <header className="glass relative flex flex-wrap items-center justify-between gap-4 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="relative grid h-11 w-11 place-items-center rounded-full border border-cyan-glow/40 bg-cyan-glow/10 shadow-glow">
          <span className="h-2 w-2 animate-pulseDot rounded-full bg-cyan-glow" />
        </div>
        <div>
          <div className="panel-title">Agentic OS · Pacific command · Tuesday</div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white md:text-3xl">{APP_NAME}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-cyan-glow">
              {COMMAND_DATE_LABEL}
            </span>
            <p className="text-xs text-white/50">
              Matthew Carson · {now ? formatDate(now.toISOString()) : "Tuesday, August 25, 2026"} · {TZ}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-5">
        <Clock zone={TZ} label="Pacific" />
        <Clock zone="UTC" label="UTC" />
        <Clock zone="America/New_York" label="New York" />
        <Clock zone="Europe/London" label="London" />
        <Clock zone="Asia/Tokyo" label="Tokyo" />
      </div>
    </header>
  );
}

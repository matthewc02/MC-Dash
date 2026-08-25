"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS } from "@/lib/constants";
import { formatTime } from "@/lib/format";
import { HealthSample } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, Panel, Sparkline } from "./ui";

export default function DmcaPanel() {
  const [sample, setSample] = useState<HealthSample | null>(null);
  const [spark, setSpark] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { push } = useArtifacts();
  const lastStatus = useRef<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/health", { cache: "no-store" });
    const j = (await res.json()) as HealthSample & { note?: string };
    setSample(j);
    setError(j.error);
    const ms = j.ttfbMs ?? j.totalMs;
    if (typeof ms === "number") setSpark((s) => [...s, ms].slice(-24));
    if (lastStatus.current !== j.status) {
      lastStatus.current = j.status;
      push({
        type: "monitor",
        label: `dmca.com ${j.ok ? "UP" : "DOWN"} ${j.status ?? ""}`.trim(),
        detail: j.title || j.error || "Live HTTP probe",
        href: "https://www.dmca.com",
        at: j.checkedAt,
        id: `dmca-${j.checkedAt}`,
        meta: { ttfbMs: j.ttfbMs ?? "—", status: j.status ?? "—" },
      });
    }
  }, [push]);

  useEffect(() => {
    load().catch(() => setError("Health probe failed"));
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.dmca);

  return (
    <Panel title="dmca.com monitor" kicker="live HTTP probe" fetchedAt={sample?.checkedAt} live>
      {!sample ? <EmptyState>Probing https://www.dmca.com…</EmptyState> : null}
      {sample ? (
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="panel-title">status</div>
            <div className={`font-display text-2xl font-bold ${sample.ok ? "text-cyan-glow" : "text-rose-400"}`}>
              {sample.ok ? "UP" : "DOWN"} {sample.status ?? ""}
            </div>
          </div>
          <div>
            <div className="panel-title">TTFB / total</div>
            <div className="font-mono text-lg tabular-nums">
              {sample.ttfbMs ?? "—"}ms <span className="text-white/40">/ {sample.totalMs ?? "—"}ms</span>
            </div>
          </div>
          <div className="col-span-2">
            <div className="panel-title">latency this session</div>
            <Sparkline values={spark} className="mt-1 h-8 w-full" />
          </div>
          <div className="col-span-2 text-xs text-white/55">
            Last check {sample.checkedAt ? formatTime(sample.checkedAt, { second: "2-digit" }) : "—"} PT
            {sample.title ? ` · “${sample.title}”` : ""}
          </div>
          <p className="col-span-2 text-[11px] text-white/35">
            Session sparkline only. No historical uptime % is stored or invented.
            {error && !sample.ok ? ` Error: ${error}` : ""}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}

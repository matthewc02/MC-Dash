"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { WebcamMeta } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, Panel } from "./ui";

export default function WebcamsPanel() {
  const [cams, setCams] = useState<WebcamMeta[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const { push } = useArtifacts();
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/webcam", { cache: "no-store" });
    const j = await res.json();
    setCams(j.cams ?? []);
    setFetchedAt(j.fetchedAt);
    setTick((n) => n + 1);
    if (!seeded.current) {
      seeded.current = true;
      (j.cams ?? [])
        .filter((c: WebcamMeta) => c.ok)
        .forEach((c: WebcamMeta) =>
          push({
            type: "webcam",
            label: c.label,
            detail: c.location,
            href: c.sourcePage,
            at: c.capturedAt,
            id: `cam-${c.id}-${c.capturedAt}`,
          }),
        );
    }
  }, [push]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.webcams);

  return (
    <Panel title="Live Whistler cameras" kicker="public stills · proxied" fetchedAt={fetchedAt} live className="col-span-full">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cams.map((c) => (
          <figure key={c.id} className="overflow-hidden rounded-xl border border-white/8 bg-black/30">
            {c.ok && c.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${c.imageUrl}&t=${tick}`}
                alt={c.label}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="grid aspect-video place-items-center px-3 text-center text-xs text-white/50">
                {c.error || "Camera down"}
              </div>
            )}
            <figcaption className="px-3 py-2">
              <div className="text-sm font-medium text-white">{c.label}</div>
              <div className="text-[11px] text-white/45">{c.location}</div>
              <div className="font-mono text-[10px] text-white/35">
                {c.ok ? formatDateTime(c.capturedAt) : "offline"} PT
              </div>
              <a href={c.sourcePage} target="_blank" rel="noreferrer" className="text-[10px] text-cyan-glow/80">
                source
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
      {cams.length === 0 ? <EmptyState>Loading public webcam stills…</EmptyState> : null}
    </Panel>
  );
}

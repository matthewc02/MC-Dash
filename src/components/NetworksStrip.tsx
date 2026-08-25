"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS } from "@/lib/constants";
import { relativeFrom } from "@/lib/format";
import { useInterval } from "@/hooks/useInterval";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel } from "./ui";

type Net = {
  id: string;
  name: string;
  site: string;
  up: boolean;
  headline: string;
  link: string;
  publishedAt: string | null;
  error: string | null;
};

export default function NetworksStrip() {
  const [networks, setNetworks] = useState<Net[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const { push } = useArtifacts();
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/networks", { cache: "no-store" });
    const j = await res.json();
    setNetworks(j.networks ?? []);
    setFetchedAt(j.fetchedAt);
    if (!seeded.current && j.networks?.[0]?.headline) {
      seeded.current = true;
      push({
        type: "network",
        label: `${j.networks[0].name}: ${j.networks[0].headline.slice(0, 40)}`,
        href: j.networks[0].link,
        at: j.fetchedAt,
        id: `net-${j.networks[0].id}-${j.fetchedAt}`,
      });
    }
  }, [push]);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.networks);

  return (
    <Panel title="Universal networks" kicker="headline strip" fetchedAt={fetchedAt} live className="col-span-full">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
        {networks.map((n) => (
          <a
            key={n.id}
            href={n.link || n.site}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/8 bg-white/[0.03] p-3 hover:border-cyan-glow/30"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-semibold">{n.name}</span>
              <span className={`h-1.5 w-1.5 rounded-full ${n.up ? "bg-cyan-glow" : "bg-rose-400"}`} />
            </div>
            <p className="mt-2 line-clamp-3 text-[12px] leading-snug text-white/75">{n.headline}</p>
            <div className="mt-2 font-mono text-[9px] uppercase tracking-wider text-white/35">
              {n.publishedAt ? relativeFrom(n.publishedAt) : n.error || "rss"}
            </div>
          </a>
        ))}
      </div>
    </Panel>
  );
}

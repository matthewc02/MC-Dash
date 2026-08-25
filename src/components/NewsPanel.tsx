"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS } from "@/lib/constants";
import { relativeFrom } from "@/lib/format";
import { fetchNews } from "@/lib/news";
import { NewsItem } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, Panel } from "./ui";

export default function NewsPanel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { push } = useArtifacts();
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const j = await fetchNews();
    if (j.error) {
      setError(j.error);
      setItems(j.items ?? []);
      setFetchedAt(j.fetchedAt ?? new Date().toISOString());
      return;
    }
    setItems(j.items ?? []);
    setFetchedAt(j.fetchedAt);
    setError(null);
    if (!seeded.current) {
      seeded.current = true;
      (j.items ?? []).slice(0, 4).forEach((it: NewsItem) =>
        push({
          type: "news",
          label: it.title.slice(0, 56),
          detail: it.source,
          href: it.link,
          at: it.publishedAt || j.fetchedAt,
          id: `news-${it.link || it.title}`,
        }),
      );
    }
  }, [push]);

  useEffect(() => {
    load().catch(() => setError("News request failed"));
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.news);

  return (
    <Panel title="Top news" kicker="Reuters · AP · BBC · CBC" fetchedAt={fetchedAt} live>
      {error ? <EmptyState>{error}</EmptyState> : null}
      {!error && items.length === 0 ? <EmptyState>Waiting on RSS…</EmptyState> : null}
      <ul className="space-y-2">
        {items.slice(0, 12).map((it) => (
          <li key={it.link + it.title} className="border-b border-white/5 pb-2 last:border-0">
            <a href={it.link} target="_blank" rel="noreferrer" className="text-sm leading-snug text-white/90 hover:text-cyan-glow">
              {it.title}
            </a>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
              {it.source} · {it.publishedAt ? relativeFrom(it.publishedAt) : "time unknown"}
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

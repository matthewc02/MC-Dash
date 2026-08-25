"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { DEFAULT_WATCHLIST, REFRESH_MS, STORAGE } from "@/lib/constants";
import { Quote } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, Panel, Sparkline } from "./ui";

export default function StocksPanel() {
  const [watchlist, setWatchlist] = useLocalStorage<string[]>(STORAGE.watchlist, [...DEFAULT_WATCHLIST]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const { push } = useArtifacts();
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/quotes?symbols=${encodeURIComponent(watchlist.join(","))}`, { cache: "no-store" });
    const j = await res.json();
    setFetchedAt(j.fetchedAt ?? new Date().toISOString());
    if (!res.ok) {
      setError(j.error || "Quotes failed");
      return;
    }
    setQuotes(j.quotes ?? []);
    setError(null);
    if (!seeded.current) {
      seeded.current = true;
      const movers = (j.quotes ?? [])
        .filter((q: Quote) => q.ok && q.changePct != null && Math.abs(q.changePct) >= 0.4)
        .slice(0, 4);
      movers.forEach((q: Quote) =>
        push({
          type: "stock",
          label: `${q.symbol} ${q.changePct! >= 0 ? "+" : ""}${q.changePct!.toFixed(2)}%`,
          detail: q.name,
          at: j.fetchedAt,
          id: `stk-${q.symbol}-${j.fetchedAt}`,
          meta: { price: q.price ?? "—", changePct: q.changePct ?? "—" },
        }),
      );
    }
  }, [watchlist, push]);

  useEffect(() => {
    load().catch(() => setError("Quotes request failed"));
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.stocks);

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const s = draft.trim().toUpperCase();
    if (!s) return;
    if (!watchlist.includes(s)) setWatchlist([...watchlist, s].slice(0, 16));
    setDraft("");
    seeded.current = false;
  }

  return (
    <Panel title="Top stocks" kicker="Yahoo / Stooq · no key" fetchedAt={fetchedAt} live>
      {error ? <EmptyState>{error}</EmptyState> : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            <tr>
              <th className="pb-2 text-left">Symbol</th>
              <th className="pb-2 text-right">Price</th>
              <th className="pb-2 text-right">Chg %</th>
              <th className="pb-2 text-right">Spark</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {quotes.map((q) => {
              const up = (q.changePct ?? 0) >= 0;
              return (
                <tr key={q.symbol} className="border-t border-white/5">
                  <td className="py-1.5 font-medium">
                    {q.symbol}
                    <div className="text-[10px] font-normal text-white/35">{q.name}</div>
                  </td>
                  <td className="py-1.5 text-right font-mono tabular-nums">
                    {q.price != null ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                  </td>
                  <td className={`py-1.5 text-right font-mono tabular-nums ${up ? "text-cyan-glow" : "text-rose-400"}`}>
                    {q.changePct != null ? `${up ? "+" : ""}${q.changePct.toFixed(2)}%` : "—"}
                  </td>
                  <td className="py-1.5 text-right">
                    <Sparkline values={q.spark} />
                  </td>
                  <td className="py-1.5 text-right">
                    <button
                      className="text-[10px] text-white/30 hover:text-white"
                      onClick={() => setWatchlist(watchlist.filter((s) => s !== q.symbol))}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <form onSubmit={onAdd} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add ticker (e.g. SHOP.TO)"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none ring-cyan-glow/40 focus:ring-2"
        />
        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs">Add</button>
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50"
          onClick={() => setWatchlist([...DEFAULT_WATCHLIST])}
        >
          Reset
        </button>
      </form>
    </Panel>
  );
}

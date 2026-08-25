"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { TZ } from "@/lib/constants";
import { fetchCalendar } from "@/lib/calendar";
import { useCallback, useEffect, useState } from "react";
import { EmptyState, Panel } from "./ui";

type Ev = {
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  calendar?: string;
};

function whenLabel(iso?: string | null) {
  if (!iso) return "all-day";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "all-day";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export default function CalendarPanel() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading Google Calendar…");
  const [clock, setClock] = useState("--:--:--");
  const { push } = useArtifacts();

  const load = useCallback(async () => {
    const j = await fetchCalendar();
    const next = (j.events ?? []).slice(0, 10);
    setEvents(next);
    setFetchedAt(j.fetchedAt ?? new Date().toISOString());
    if (j.error) setMessage(j.error);
    else if (!next.length) setMessage("No upcoming Google Calendar items.");
    else setMessage("");
    next.forEach((ev: Ev) =>
      push({
        type: "calendar",
        label: ev.summary,
        detail: ev.calendar || "Google Calendar",
        at: ev.start || j.fetchedAt,
        id: `cal-${ev.summary}-${ev.start}`,
      }),
    );
  }, [push]);

  useEffect(() => {
    load().catch(() => setMessage("Calendar request failed."));
  }, [load]);

  useEffect(() => {
    const tick = () => {
      setClock(
        new Intl.DateTimeFormat("en-CA", {
          timeZone: TZ,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date()),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Panel title="Calendar" kicker="Next 10 · Google Calendar" fetchedAt={fetchedAt} live>
      <div className="mb-3 font-mono text-3xl tabular-nums text-cyan-glow">{clock}</div>
      {events.length === 0 ? <EmptyState>{message}</EmptyState> : null}
      <ol className="space-y-2">
        {events.map((ev, i) => (
          <li key={`${ev.summary}-${ev.start}-${i}`} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div className="font-medium text-white">{ev.summary.trim()}</div>
              <div className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-white/35">{String(i + 1).padStart(2, "0")}</div>
            </div>
            <div className="font-mono text-[11px] text-white/45">
              {whenLabel(ev.start)}
              {ev.calendar ? ` · ${ev.calendar}` : ""}
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

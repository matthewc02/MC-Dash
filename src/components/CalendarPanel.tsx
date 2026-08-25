"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS, STORAGE, TZ } from "@/lib/constants";
import { fetchCalendar } from "@/lib/calendar";
import { formatTime } from "@/lib/format";
import { useInterval } from "@/hooks/useInterval";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { EmptyState, Panel } from "./ui";

type Ev = { summary: string; start: string | null; end: string | null; location: string | null };

export default function CalendarPanel() {
  const [ics, setIcs] = useLocalStorage(STORAGE.ics, "");
  const [draft, setDraft] = useState("");
  const [events, setEvents] = useState<Ev[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [message, setMessage] = useState("No ICS feed yet. Today’s agenda is empty on purpose.");
  const [clock, setClock] = useState("--:--:--");
  const { push } = useArtifacts();

  useEffect(() => setDraft(ics), [ics]);

  const load = useCallback(async () => {
    const j = await fetchCalendar(ics.trim());
    setEvents(j.events ?? []);
    setFetchedAt(j.fetchedAt ?? new Date().toISOString());
    if (j.message) setMessage(j.message);
    else if (j.error) setMessage(j.error);
    else if (!j.events?.length) setMessage("ICS loaded, but nothing is scheduled for today in America/Vancouver.");
    else setMessage("");
    (j.events ?? []).slice(0, 4).forEach((ev: Ev) =>
      push({
        type: "calendar",
        label: ev.summary,
        detail: ev.location || "Calendar event",
        at: ev.start || j.fetchedAt,
        id: `cal-${ev.summary}-${ev.start}`,
      }),
    );
  }, [ics, push]);

  useEffect(() => {
    load().catch(() => setMessage("Calendar request failed."));
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, ics ? REFRESH_MS.calendar : null);

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

  function onSave(e: FormEvent) {
    e.preventDefault();
    setIcs(draft.trim());
  }

  return (
    <Panel title="Calendar" kicker="America/Vancouver" fetchedAt={fetchedAt} live>
      <div className="mb-3 font-mono text-3xl tabular-nums text-cyan-glow">{clock}</div>
      {events.length === 0 ? <EmptyState>{message} Meetings are never invented.</EmptyState> : null}
      <ul className="space-y-2">
        {events.map((ev, i) => (
          <li key={i} className="rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
            <div className="font-medium text-white">{ev.summary}</div>
            <div className="font-mono text-[11px] text-white/45">
              {ev.start ? formatTime(ev.start) : "all-day"}
              {ev.end ? ` – ${formatTime(ev.end)}` : ""} {ev.location ? `· ${ev.location}` : ""}
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={onSave} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Optional public ICS URL…"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none ring-cyan-glow/40 focus:ring-2"
        />
        <button className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/70">Save</button>
      </form>
    </Panel>
  );
}

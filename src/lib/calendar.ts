import { explainFetchError } from "@/lib/browserFetch";

export type CalEvent = {
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
  calendar?: string;
};

const SNAPSHOT = "/MC-Dash/calendar.json";

export async function fetchCalendar(_icsUrl?: string) {
  try {
    const res = await fetch(SNAPSHOT, { cache: "no-store" });
    if (!res.ok) {
      return {
        events: [] as CalEvent[],
        fetchedAt: new Date().toISOString(),
        empty: true,
        error: `Calendar snapshot HTTP ${res.status}`,
      };
    }
    const j = (await res.json()) as {
      events?: CalEvent[];
      fetchedAt?: string;
      source?: string;
    };
    const events = (j.events ?? []).slice(0, 10);
    return {
      events,
      fetchedAt: j.fetchedAt ?? new Date().toISOString(),
      empty: events.length === 0,
      source: j.source ?? "Google Calendar",
    };
  } catch (e) {
    return {
      error: explainFetchError(e, "Calendar"),
      events: [] as CalEvent[],
      fetchedAt: new Date().toISOString(),
      empty: true,
    };
  }
}

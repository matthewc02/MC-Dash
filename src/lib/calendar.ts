import { TZ } from "@/lib/constants";
import { explainFetchError } from "@/lib/browserFetch";

export type CalEvent = {
  summary: string;
  start: string | null;
  end: string | null;
  location: string | null;
};

function unfold(ics: string) {
  return ics.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "");
}

function icsTimeToDate(raw: string) {
  const m = raw.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z)?/);
  if (m) {
    const iso = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}${m[7] ? "Z" : ""}`;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const dOnly = raw.match(/(\d{4})(\d{2})(\d{2})/);
  if (dOnly) {
    const d = new Date(`${dOnly[1]}-${dOnly[2]}-${dOnly[3]}T12:00:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function pacificYmd(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function parseIcs(ics: string): CalEvent[] {
  const text = unfold(ics);
  const blocks = text.split("BEGIN:VEVENT").slice(1);
  const events: CalEvent[] = [];
  for (const b of blocks) {
    const summary = b.match(/SUMMARY(?:;[^:]*)?:([^\n\r]+)/)?.[1]?.trim() ?? "(no title)";
    const location = b.match(/LOCATION(?:;[^:]*)?:([^\n\r]+)/)?.[1]?.trim() ?? null;
    const dtStart = b.match(/DTSTART(?:;[^:]*)?:([^\n\r]+)/)?.[1]?.trim() ?? "";
    const dtEnd = b.match(/DTEND(?:;[^:]*)?:([^\n\r]+)/)?.[1]?.trim() ?? "";
    const start = icsTimeToDate(dtStart);
    const end = icsTimeToDate(dtEnd);
    events.push({
      summary: summary.replace(/\\,/g, ",").replace(/\\n/g, " "),
      start: start ? start.toISOString() : null,
      end: end ? end.toISOString() : null,
      location,
    });
  }
  return events;
}

export async function fetchCalendar(url: string) {
  if (!url) {
    return {
      events: [] as CalEvent[],
      fetchedAt: new Date().toISOString(),
      empty: true,
      message: "No ICS feed configured. Paste a public ICS URL to load today’s agenda.",
    };
  }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        events: [] as CalEvent[],
        fetchedAt: new Date().toISOString(),
        empty: true,
        error: "ICS URL must be http(s)",
      };
    }
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        error: `ICS fetch HTTP ${res.status}`,
        events: [] as CalEvent[],
        fetchedAt: new Date().toISOString(),
        empty: true,
      };
    }
    const ics = await res.text();
    const today = pacificYmd(new Date());
    const events = parseIcs(ics).filter((ev) => {
      if (!ev.start) return false;
      return pacificYmd(new Date(ev.start)) === today;
    });
    return { events, fetchedAt: new Date().toISOString(), empty: events.length === 0, icsUrl: url };
  } catch (e) {
    return {
      error: explainFetchError(e, "ICS"),
      events: [] as CalEvent[],
      fetchedAt: new Date().toISOString(),
      empty: true,
    };
  }
}

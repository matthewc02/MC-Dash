"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { REFRESH_MS } from "@/lib/constants";
import { wallClock, weatherLabel, windDir } from "@/lib/format";
import { WeatherBundle } from "@/lib/types";
import { useInterval } from "@/hooks/useInterval";
import { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, Panel } from "./ui";

function Place({ data }: { data: WeatherBundle }) {
  const c = data.current;
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xs text-white/45">{data.name}</div>
          <div className="font-display text-4xl font-extrabold tracking-tight">
            {c.temp != null ? `${Math.round(c.temp)}°` : "—"}
          </div>
          <div className="text-sm text-white/60">{weatherLabel(c.weatherCode)}</div>
        </div>
        <div className="text-right font-mono text-[11px] text-white/50">
          <div>feels {c.feels != null ? `${Math.round(c.feels)}°` : "—"}</div>
          <div>RH {c.humidity ?? "—"}%</div>
          <div>
            wind {c.wind != null ? Math.round(c.wind) : "—"} km/h {windDir(c.windDir)}
          </div>
          <div>pres {c.pressure != null ? Math.round(c.pressure) : "—"} hPa</div>
          <div>UV {c.uv ?? "—"}</div>
        </div>
      </div>
      <div className="mt-3 overflow-x-auto">
        <div className="flex min-w-max gap-2">
          {data.hourly.map((h) => (
            <div key={h.time} className="w-12 rounded-lg bg-white/[0.03] px-1 py-2 text-center">
              <div className="font-mono text-[9px] text-white/40">{wallClock(h.time)}</div>
              <div className="text-sm">{h.temp != null ? Math.round(h.temp) : "—"}°</div>
              <div className="text-[9px] text-white/35">{h.pop ?? "—"}%</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1">
        {data.daily.map((d) => (
          <div key={d.date} className="rounded-lg bg-black/20 px-1 py-2 text-center">
            <div className="font-mono text-[9px] uppercase text-white/40">
              {new Date(d.date + "T12:00:00").toLocaleDateString("en-CA", { weekday: "short", timeZone: "America/Vancouver" })}
            </div>
            <div className="text-[12px]">{d.tmax != null ? Math.round(d.tmax) : "—"}°</div>
            <div className="text-[10px] text-white/45">{d.tmin != null ? Math.round(d.tmin) : "—"}°</div>
            <div className="text-[9px] text-white/35">UV {d.uv ?? "—"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeatherPanel() {
  const [van, setVan] = useState<WeatherBundle | null>(null);
  const [whi, setWhi] = useState<WeatherBundle | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { push } = useArtifacts();
  const seeded = useRef(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/weather", { cache: "no-store" });
    const j = await res.json();
    setFetchedAt(j.fetchedAt ?? new Date().toISOString());
    if (!res.ok) {
      setError(j.error || "Weather failed");
      return;
    }
    setVan(j.vancouver);
    setWhi(j.whistler);
    setError(null);
    if (!seeded.current && j.vancouver?.current?.temp != null) {
      seeded.current = true;
      push({
        type: "weather",
        label: `Vancouver ${Math.round(j.vancouver.current.temp)}°`,
        detail: weatherLabel(j.vancouver.current.weatherCode),
        at: j.fetchedAt,
        id: `wx-van-${j.fetchedAt}`,
      });
      if (j.whistler?.current?.temp != null) {
        push({
          type: "weather",
          label: `Whistler ${Math.round(j.whistler.current.temp)}°`,
          detail: weatherLabel(j.whistler.current.weatherCode),
          at: j.fetchedAt,
          id: `wx-whi-${j.fetchedAt}`,
        });
      }
    }
  }, [push]);

  useEffect(() => {
    load().catch(() => setError("Weather request failed"));
  }, [load]);
  useInterval(() => {
    load().catch(() => undefined);
  }, REFRESH_MS.weather);

  return (
    <>
      <Panel title="Weather · Home" kicker="Open-Meteo · Vancouver BC" fetchedAt={fetchedAt} live>
        {error ? <EmptyState>{error}</EmptyState> : null}
        {van ? <Place data={van} /> : !error ? <EmptyState>Loading Vancouver…</EmptyState> : null}
      </Panel>
      <Panel title="Weather · Whistler" kicker="Open-Meteo · Whistler BC" fetchedAt={fetchedAt} live>
        {whi ? <Place data={whi} /> : !error ? <EmptyState>Loading Whistler…</EmptyState> : null}
      </Panel>
    </>
  );
}

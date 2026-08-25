"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { useWork } from "@/context/WorkContext";
import { formatTime } from "@/lib/format";
import { ArtifactType } from "@/lib/types";
import { Panel } from "./ui";

const COLOR: Record<ArtifactType, string> = {
  email: "#f5b942",
  note: "#f5b942",
  calendar: "#7aa8ff",
  task: "#7dffb3",
  work: "#f5b942",
  news: "#3ee0c6",
  stock: "#ffd166",
  monitor: "#d46bff",
  weather: "#8ec8ff",
  webcam: "#c4b5fd",
  network: "#94a3b8",
};

function nodeType(type: ArtifactType, meta?: Record<string, string | number | boolean | null>) {
  if (type === "work" && typeof meta?.stream === "string") return meta.stream;
  return type;
}

export default function ArtifactRing() {
  const { setSelected } = useArtifacts();
  const { ringNodes, ready } = useWork();
  const n = ringNodes.length;

  return (
    <Panel title="Artifact Ring" kicker="today’s tasks" live className="min-h-[420px]">
      <div className="relative mx-auto aspect-square w-full max-w-[400px]">
        <div className="absolute inset-0 grid place-items-center">
          <div className="orbit absolute h-[78%] w-[78%] rounded-full border border-dashed border-cyan-glow/25" />
          <div className="ring-breathe absolute h-[62%] w-[62%] rounded-full border border-white/10" />
          <div className="absolute h-[38%] w-[38%] rounded-full bg-gradient-to-b from-cyan-glow/10 to-transparent ring-1 ring-white/10" />
          <div className="relative z-10 text-center">
            <div className="panel-title">today</div>
            <div className="font-display text-4xl font-extrabold text-white">{ready ? n : "—"}</div>
            <div className="text-[11px] text-white/50">{n ? "click a node" : "awaiting tasks"}</div>
          </div>
        </div>
        {n === 0 ? (
          <div className="absolute inset-0">
            {Array.from({ length: 8 }).map((_, i) => {
              const ang = (i / 8) * Math.PI * 2 - Math.PI / 2;
              const x = 50 + Math.cos(ang) * 38;
              const y = 50 + Math.sin(ang) * 38;
              return (
                <div
                  key={i}
                  className="ring-await absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-white/5"
                  style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.35}s` }}
                />
              );
            })}
          </div>
        ) : (
          ringNodes.map((a, i) => {
            const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(ang) * 38;
            const y = 50 + Math.sin(ang) * 38;
            const kind = nodeType(a.type, a.meta);
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className="ring-node absolute z-20 w-[132px] rounded-xl border border-white/10 bg-ink-900/90 px-2 py-1.5 text-left shadow-glass transition hover:border-cyan-glow/50 hover:bg-ink-800"
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i % 6) * 0.4}s` }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: COLOR[a.type] }} />
                  <span className="font-mono text-[9px] uppercase tracking-wider text-white/45">
                    {formatTime(a.at)} · {kind}
                  </span>
                </div>
                <div className="truncate text-[11px] text-white/90">{a.label}</div>
              </button>
            );
          })
        )}
      </div>
      <p className="mt-2 text-center text-[11px] text-white/40">
        Ring shows today’s local tasks plus Deck / Bathroom / Shop activity. Empty nodes mean nothing has been logged yet — not a fabricated dump.
      </p>
    </Panel>
  );
}

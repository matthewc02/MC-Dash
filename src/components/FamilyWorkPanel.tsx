"use client";

import { FAMILY_STREAMS, type FamilyStream } from "@/lib/constants";
import { useWork } from "@/context/WorkContext";
import { formatDateTime } from "@/lib/format";
import { FormEvent, useState } from "react";
import { EmptyState, Panel } from "./ui";

const ACCENT: Record<FamilyStream, string> = {
  Deck: "#f5b942",
  Bathroom: "#7aa8ff",
  Shop: "#d46bff",
};

function StreamColumn({ stream }: { stream: FamilyStream }) {
  const { familyWork, addActivity } = useWork();
  const [note, setNote] = useState("");
  const [owner, setOwner] = useState("");
  const lines = familyWork[stream] ?? [];
  const latest = lines[0];

  function onAdd(e: FormEvent) {
    e.preventDefault();
    addActivity(stream, note, owner);
    setNote("");
    setOwner("");
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: ACCENT[stream] }} />
          <h3 className="font-display text-base font-semibold text-white">{stream}</h3>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {lines.length ? `${lines.length} logged` : "awaiting"}
        </span>
      </div>
      {latest ? (
        <div className="mb-3 rounded-lg bg-black/25 px-3 py-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            latest · {formatDateTime(latest.at)} PT
            {latest.owner ? ` · ${latest.owner}` : ""}
          </div>
          <p className="mt-1 text-sm text-white/90">{latest.note}</p>
          {latest.source ? (
            <div className="mt-1 font-mono text-[10px] text-white/35">source {latest.source}</div>
          ) : null}
        </div>
      ) : (
        <div className="mb-3">
          <EmptyState>
            Awaiting first activity on {stream}. No jobs, owners, or last actions invented.
          </EmptyState>
        </div>
      )}
      <form onSubmit={onAdd} className="space-y-2">
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={`${stream} note…`}
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-glow/40 focus:ring-2"
        />
        <div className="flex gap-2">
          <input
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner (optional)"
            className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-glow/40 focus:ring-2"
          />
          <button className="rounded-lg bg-cyan-glow/20 px-3 py-2 text-sm text-cyan-glow hover:bg-cyan-glow/30">Add</button>
        </div>
      </form>
      {lines.length > 1 ? (
        <ul className="mt-3 max-h-36 space-y-1.5 overflow-y-auto">
          {lines.slice(1).map((line) => (
            <li key={line.id} className="border-t border-white/5 pt-1.5 text-[12px] text-white/70">
              <span className="font-mono text-[10px] text-white/40">{formatDateTime(line.at)}</span>
              {line.owner ? <span className="text-white/45"> · {line.owner}</span> : null}
              <div>{line.note}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default function FamilyWorkPanel() {
  const { familyWork } = useWork();
  const latestAt = FAMILY_STREAMS.map((s) => familyWork[s]?.[0]?.at).filter(Boolean).sort().at(-1) ?? null;

  return (
    <Panel title="Family work" kicker="Deck · Bathroom · Shop" fetchedAt={latestAt}>
      <p className="mb-3 text-[11px] text-white/40">
        Three family-work streams. Empty until you log a line. No jobs, owners, or progress invented.
      </p>
      <div className="grid gap-3 md:grid-cols-3">
        {FAMILY_STREAMS.map((stream) => (
          <StreamColumn key={stream} stream={stream} />
        ))}
      </div>
    </Panel>
  );
}

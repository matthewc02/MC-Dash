"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { formatDateTime } from "@/lib/format";

export default function DetailDrawer() {
  const { selected, setSelected } = useArtifacts();
  if (!selected) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => setSelected(null)}>
      <aside
        className="glass h-full w-full max-w-md overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Artifact detail"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="panel-title">{selected.type}</div>
            <h3 className="font-display text-2xl font-bold text-white">{selected.label}</h3>
            <p className="mt-1 font-mono text-xs text-white/50">{formatDateTime(selected.at)} PT</p>
          </div>
          <button
            className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
            onClick={() => setSelected(null)}
          >
            Close
          </button>
        </div>
        {selected.detail ? <p className="mt-4 text-sm leading-relaxed text-white/75">{selected.detail}</p> : null}
        {selected.href ? (
          <a
            href={selected.href}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm text-cyan-glow underline"
          >
            Open source
          </a>
        ) : null}
        {selected.meta ? (
          <dl className="mt-6 space-y-2 font-mono text-xs text-white/60">
            {Object.entries(selected.meta).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-white/5 py-1">
                <dt className="uppercase tracking-wider">{k}</dt>
                <dd className="text-white/85">{String(v)}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </aside>
    </div>
  );
}

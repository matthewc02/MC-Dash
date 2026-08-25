"use client";

import { CATS, FAMILY, STORAGE } from "@/lib/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Panel } from "./ui";

function Card({
  name,
  note,
  onChange,
  kind,
}: {
  name: string;
  note: string;
  onChange: (v: string) => void;
  kind: "person" | "cat";
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-ink-800 font-display text-xs text-cyan-glow">
          {kind === "cat" ? "🐾" : name.slice(0, 1)}
        </div>
        <div className="font-display text-sm font-semibold">{name}</div>
      </div>
      <textarea
        value={note}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Private local note…"
        rows={3}
        className="w-full resize-none rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none ring-cyan-glow/40 focus:ring-2"
      />
    </div>
  );
}

export function FamilyPanels() {
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(STORAGE.family, {});
  return (
    <Panel title="Family" kicker="local notes only" fetchedAt={new Date().toISOString()} className="col-span-full">
      <p className="mb-3 text-[11px] text-white/40">
        Names only. No invented ages, facts, or photos of real people.
      </p>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {FAMILY.map((name) => (
          <Card
            key={name}
            name={name}
            kind="person"
            note={notes[name] ?? ""}
            onChange={(v) => setNotes({ ...notes, [name]: v })}
          />
        ))}
      </div>
    </Panel>
  );
}

export function CatPanels() {
  const [notes, setNotes] = useLocalStorage<Record<string, string>>(STORAGE.cats, {});
  return (
    <Panel title="Cats" kicker="local notes only" fetchedAt={new Date().toISOString()} className="col-span-full">
      <p className="mb-3 text-[11px] text-white/40">
        Generic icon only. No generated photos of Jax, Atom, or Mau.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {CATS.map((name) => (
          <Card
            key={name}
            name={name}
            kind="cat"
            note={notes[name] ?? ""}
            onChange={(v) => setNotes({ ...notes, [name]: v })}
          />
        ))}
      </div>
    </Panel>
  );
}

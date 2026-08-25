"use client";

import { useArtifacts } from "@/context/ArtifactContext";
import { STORAGE } from "@/lib/constants";
import { uid } from "@/lib/format";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FormEvent, useState } from "react";
import { EmptyState, Panel } from "./ui";

type Note = { id: string; text: string; createdAt: string };

export default function EmailsPanel() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE.notes, []);
  const [text, setText] = useState("");
  const [updated, setUpdated] = useState<string | null>(null);
  const { push } = useArtifacts();

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    const note: Note = { id: uid("note"), text: t, createdAt: new Date().toISOString() };
    setNotes([note, ...notes]);
    setText("");
    setUpdated(note.createdAt);
    push({ type: "note", label: t.slice(0, 48), detail: "Local priority note — not an email.", at: note.createdAt, id: note.id });
  }

  return (
    <Panel title="Top emails" kicker="inbox" fetchedAt={updated}>
      <EmptyState>
        Gmail is not connected on this dashboard. No inbox is being read, and no messages are invented.
        Add a local priority note if you need a stand-in for today.
      </EmptyState>
      <form onSubmit={onAdd} className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Priority note…"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-glow/40 focus:ring-2"
        />
        <button className="rounded-lg bg-cyan-glow/20 px-3 py-2 text-sm text-cyan-glow hover:bg-cyan-glow/30">Add</button>
      </form>
      <ul className="mt-3 space-y-2">
        {notes.map((n) => (
          <li key={n.id} className="flex items-start justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2 text-sm">
            <span>{n.text}</span>
            <button className="text-[11px] text-white/40 hover:text-white" onClick={() => setNotes(notes.filter((x) => x.id !== n.id))}>
              delete
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

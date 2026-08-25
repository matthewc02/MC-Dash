"use client";

import { useWork } from "@/context/WorkContext";
import { FormEvent, useState } from "react";
import { EmptyState, Panel } from "./ui";

export default function TasksPanel() {
  const { tasks, addTask, toggleTask, removeTask } = useWork();
  const [title, setTitle] = useState("");
  const updated = tasks[0]?.createdAt ?? null;

  function onAdd(e: FormEvent) {
    e.preventDefault();
    addTask(title);
    setTitle("");
  }

  return (
    <Panel title="Tasks" kicker="local" fetchedAt={updated} live>
      <form onSubmit={onAdd} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task for today…"
          className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-glow/40 focus:ring-2"
        />
        <button className="rounded-lg bg-cyan-glow/20 px-3 py-2 text-sm text-cyan-glow hover:bg-cyan-glow/30">Add</button>
      </form>
      {tasks.length === 0 ? (
        <div className="mt-3">
          <EmptyState>No tasks yet. This list lives in your browser (localStorage) and feeds the artifact ring.</EmptyState>
        </div>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-2 py-1.5 text-sm">
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} />
              <span className={`flex-1 ${t.done ? "text-white/35 line-through" : ""}`}>{t.title}</span>
              <button className="text-[11px] text-white/35 hover:text-white" onClick={() => removeTask(t.id)}>
                delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

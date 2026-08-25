"use client";

import { FAMILY_STREAMS, STORAGE, type FamilyStream } from "@/lib/constants";
import { isTodayPT, uid } from "@/lib/format";
import { Artifact, FamilyActivity, FamilyWorkState, Task } from "@/lib/types";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { createContext, useCallback, useContext, useMemo } from "react";

const EMPTY_WORK: FamilyWorkState = { Deck: [], Bathroom: [], Shop: [] };

function toRing(tasks: Task[], work: FamilyWorkState): Artifact[] {
  const nodes: Artifact[] = [];
  for (const t of tasks) {
    if (t.done && !isTodayPT(t.createdAt)) continue;
    nodes.push({
      id: t.id,
      type: "task",
      label: t.title.slice(0, 48),
      detail: t.done ? "Local task (done)." : "Local task for today.",
      at: t.createdAt,
      meta: { source: "Tasks", done: t.done },
    });
  }
  for (const stream of FAMILY_STREAMS) {
    for (const a of work[stream] ?? []) {
      if (!isTodayPT(a.at)) continue;
      const owner = a.owner?.trim();
      nodes.push({
        id: a.id,
        type: "work",
        label: a.note.slice(0, 48),
        detail: owner ? `${stream} · ${owner}` : `${stream} stream`,
        at: a.at,
        meta: {
          stream,
          owner: owner || "—",
          source: a.source ?? "local",
        },
      });
    }
  }
  nodes.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return nodes.slice(0, 16);
}

type Ctx = {
  tasks: Task[];
  addTask: (title: string) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  familyWork: FamilyWorkState;
  addActivity: (stream: FamilyStream, note: string, owner?: string) => void;
  ringNodes: Artifact[];
  ready: boolean;
};

const WorkContext = createContext<Ctx | null>(null);

export function WorkProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks, tasksReady] = useLocalStorage<Task[]>(STORAGE.tasks, []);
  const [familyWork, setFamilyWork, workReady] = useLocalStorage<FamilyWorkState>(STORAGE.familyWork, EMPTY_WORK);

  const addTask = useCallback(
    (title: string) => {
      const t = title.trim();
      if (!t) return;
      const task: Task = { id: uid("task"), title: t, done: false, createdAt: new Date().toISOString() };
      setTasks([task, ...tasks]);
    },
    [setTasks, tasks],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks(tasks.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
    },
    [setTasks, tasks],
  );

  const removeTask = useCallback(
    (id: string) => {
      setTasks(tasks.filter((x) => x.id !== id));
    },
    [setTasks, tasks],
  );

  const addActivity = useCallback(
    (stream: FamilyStream, note: string, owner?: string) => {
      const n = note.trim();
      if (!n) return;
      const activity: FamilyActivity = {
        id: uid("work"),
        stream,
        note: n,
        owner: owner?.trim() || undefined,
        at: new Date().toISOString(),
        source: "local",
      };
      const current = familyWork[stream] ?? [];
      setFamilyWork({ ...familyWork, [stream]: [activity, ...current] });
    },
    [familyWork, setFamilyWork],
  );

  const ringNodes = useMemo(() => toRing(tasks, familyWork), [tasks, familyWork]);
  const ready = tasksReady && workReady;

  const value = useMemo(
    () => ({ tasks, addTask, toggleTask, removeTask, familyWork, addActivity, ringNodes, ready }),
    [tasks, addTask, toggleTask, removeTask, familyWork, addActivity, ringNodes, ready],
  );

  return <WorkContext.Provider value={value}>{children}</WorkContext.Provider>;
}

export function useWork() {
  const ctx = useContext(WorkContext);
  if (!ctx) throw new Error("useWork outside provider");
  return ctx;
}

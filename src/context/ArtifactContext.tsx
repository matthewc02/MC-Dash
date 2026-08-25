"use client";

import { Artifact } from "@/lib/types";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Ctx = {
  artifacts: Artifact[];
  push: (a: Omit<Artifact, "id" | "at"> & { id?: string; at?: string }) => void;
  selected: Artifact | null;
  setSelected: (a: Artifact | null) => void;
};

const ArtifactContext = createContext<Ctx | null>(null);

export function ArtifactProvider({ children }: { children: React.ReactNode }) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [selected, setSelected] = useState<Artifact | null>(null);

  const push = useCallback((a: Omit<Artifact, "id" | "at"> & { id?: string; at?: string }) => {
    const item: Artifact = {
      id: a.id ?? `${a.type}-${a.label}-${a.at ?? ""}`.slice(0, 80),
      at: a.at ?? new Date().toISOString(),
      type: a.type,
      label: a.label,
      detail: a.detail,
      href: a.href,
      meta: a.meta,
    };
    setArtifacts((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [item, ...prev].slice(0, 16);
    });
  }, []);

  const value = useMemo(() => ({ artifacts, push, selected, setSelected }), [artifacts, push, selected]);
  return <ArtifactContext.Provider value={value}>{children}</ArtifactContext.Provider>;
}

export function useArtifacts() {
  const ctx = useContext(ArtifactContext);
  if (!ctx) throw new Error("useArtifacts outside provider");
  return ctx;
}

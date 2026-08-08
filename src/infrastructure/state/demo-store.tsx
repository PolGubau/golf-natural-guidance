"use client";

import { atom, Provider, useAtomValue, useSetAtom } from "jotai";
import { type ReactNode, useEffect } from "react";
import type { DemoData } from "~/domain/models";
import { LocalStorageDemoRepository } from "~/infrastructure/local-storage/local-demo-repository";

const repository = new LocalStorageDemoRepository();
const dataAtom = atom<DemoData | null>(null);
const statusAtom = atom<"loading" | "ready" | "error">("loading");
const recoveredAtom = atom(false);

const hydrateAtom = atom(null, async (_get, set) => {
  try {
    const result = await repository.load();
    set(dataAtom, result.data);
    set(recoveredAtom, result.recovered);
    set(statusAtom, "ready");
  } catch {
    set(statusAtom, "error");
  }
});

const commitAtom = atom(
  null,
  async (get, set, recipe: (current: DemoData) => DemoData) => {
    const current = get(dataAtom);
    if (!current) return;
    const next = recipe(current);
    set(dataAtom, next);
    try {
      await repository.save(next);
    } catch {
      set(statusAtom, "error");
    }
  },
);

const resetAtom = atom(null, async (_get, set) => {
  set(statusAtom, "loading");
  const result = await repository.reset();
  set(dataAtom, result.data);
  set(recoveredAtom, false);
  set(statusAtom, "ready");
});

function Hydrator({ children }: { children: ReactNode }) {
  const hydrate = useSetAtom(hydrateAtom);
  useEffect(() => void hydrate(), [hydrate]);
  return children;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  return (
    <Provider>
      <Hydrator>{children}</Hydrator>
    </Provider>
  );
}

export function useDemo() {
  return {
    data: useAtomValue(dataAtom),
    status: useAtomValue(statusAtom),
    recovered: useAtomValue(recoveredAtom),
    commit: useSetAtom(commitAtom),
    reset: useSetAtom(resetAtom),
  };
}

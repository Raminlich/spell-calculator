"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  defaultNouns,
  defaultDeliveryVerbs,
  defaultModifierVerbs,
  defaultGlobalConfig,
} from "@/lib/defaultData";
import type {
  Noun,
  DeliveryVerb,
  ModifierVerb,
  GlobalConfig,
} from "@/lib/types";
import {
  createSnapshot,
  downloadSnapshot,
  loadSnapshotFromStorage,
  readSnapshotFromFile,
  saveSnapshotToStorage,
  type WorkspaceSnapshot,
} from "@/lib/persistence";

type SpellConfigContextValue = {
  nouns: Noun[];
  setNouns: (nouns: Noun[]) => void;
  updateNoun: (id: string, noun: Noun) => void;
  deliveryVerbs: DeliveryVerb[];
  setDeliveryVerbs: (verbs: DeliveryVerb[]) => void;
  updateDelivery: (id: string, verb: DeliveryVerb) => void;
  modifierVerbs: ModifierVerb[];
  setModifierVerbs: (verbs: ModifierVerb[]) => void;
  updateModifier: (id: string, verb: ModifierVerb) => void;
  config: GlobalConfig;
  setConfig: (config: GlobalConfig) => void;
  resetAll: () => void;
  /** ISO timestamp of the last successful save, or null. */
  lastSavedAt: string | null;
  /** True after the initial localStorage hydrate attempt finishes. */
  hydrated: boolean;
  /** Persist current workspace to localStorage. Returns saved timestamp. */
  saveWorkspace: () => string;
  /** Restore workspace from localStorage. Returns false if nothing saved. */
  loadWorkspace: () => boolean;
  /** Download current workspace as a JSON file. */
  exportWorkspace: () => void;
  /**
   * Load workspace from an exported JSON file.
   * On success, applies it and writes localStorage. Returns false if invalid.
   */
  importWorkspace: (file: File) => Promise<boolean>;
};

const SpellConfigContext = createContext<SpellConfigContextValue | null>(null);

function applySnapshot(
  snapshot: WorkspaceSnapshot,
  setters: {
    setNouns: (n: Noun[]) => void;
    setDeliveryVerbs: (v: DeliveryVerb[]) => void;
    setModifierVerbs: (v: ModifierVerb[]) => void;
    setConfig: (c: GlobalConfig) => void;
    setLastSavedAt: (iso: string | null) => void;
  }
) {
  setters.setNouns(snapshot.nouns);
  setters.setDeliveryVerbs(snapshot.deliveryVerbs);
  setters.setModifierVerbs(snapshot.modifierVerbs);
  setters.setConfig(snapshot.config);
  setters.setLastSavedAt(snapshot.savedAt);
}

export function SpellConfigProvider({ children }: { children: ReactNode }) {
  const [nouns, setNouns] = useState<Noun[]>(defaultNouns);
  const [deliveryVerbs, setDeliveryVerbs] =
    useState<DeliveryVerb[]>(defaultDeliveryVerbs);
  const [modifierVerbs, setModifierVerbs] =
    useState<ModifierVerb[]>(defaultModifierVerbs);
  const [config, setConfig] = useState<GlobalConfig>(defaultGlobalConfig);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const existing = loadSnapshotFromStorage();
    if (existing) {
      applySnapshot(existing, {
        setNouns,
        setDeliveryVerbs,
        setModifierVerbs,
        setConfig,
        setLastSavedAt,
      });
    }
    setHydrated(true);
  }, []);

  function updateNoun(id: string, noun: Noun) {
    setNouns((prev) => prev.map((n) => (n.id === id ? noun : n)));
  }

  function updateDelivery(id: string, verb: DeliveryVerb) {
    setDeliveryVerbs((prev) => prev.map((v) => (v.id === id ? verb : v)));
  }

  function updateModifier(id: string, verb: ModifierVerb) {
    setModifierVerbs((prev) => prev.map((v) => (v.id === id ? verb : v)));
  }

  function resetAll() {
    setNouns(defaultNouns);
    setDeliveryVerbs(defaultDeliveryVerbs);
    setModifierVerbs(defaultModifierVerbs);
    setConfig(defaultGlobalConfig);
  }

  const saveWorkspace = useCallback(() => {
    const snapshot = createSnapshot({
      nouns,
      deliveryVerbs,
      modifierVerbs,
      config,
    });
    saveSnapshotToStorage(snapshot);
    setLastSavedAt(snapshot.savedAt);
    return snapshot.savedAt;
  }, [nouns, deliveryVerbs, modifierVerbs, config]);

  const loadWorkspace = useCallback(() => {
    const existing = loadSnapshotFromStorage();
    if (!existing) return false;
    applySnapshot(existing, {
      setNouns,
      setDeliveryVerbs,
      setModifierVerbs,
      setConfig,
      setLastSavedAt,
    });
    return true;
  }, []);

  const exportWorkspace = useCallback(() => {
    const snapshot = createSnapshot({
      nouns,
      deliveryVerbs,
      modifierVerbs,
      config,
    });
    downloadSnapshot(snapshot);
  }, [nouns, deliveryVerbs, modifierVerbs, config]);

  const importWorkspace = useCallback(async (file: File) => {
    const snapshot = await readSnapshotFromFile(file);
    if (!snapshot) return false;
    applySnapshot(snapshot, {
      setNouns,
      setDeliveryVerbs,
      setModifierVerbs,
      setConfig,
      setLastSavedAt,
    });
    saveSnapshotToStorage(snapshot);
    return true;
  }, []);

  return (
    <SpellConfigContext.Provider
      value={{
        nouns,
        setNouns,
        updateNoun,
        deliveryVerbs,
        setDeliveryVerbs,
        updateDelivery,
        modifierVerbs,
        setModifierVerbs,
        updateModifier,
        config,
        setConfig,
        resetAll,
        lastSavedAt,
        hydrated,
        saveWorkspace,
        loadWorkspace,
        exportWorkspace,
        importWorkspace,
      }}
    >
      {children}
    </SpellConfigContext.Provider>
  );
}

export function useSpellConfig() {
  const ctx = useContext(SpellConfigContext);
  if (!ctx) {
    throw new Error("useSpellConfig must be used within SpellConfigProvider");
  }
  return ctx;
}

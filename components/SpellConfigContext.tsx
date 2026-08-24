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
  mergeCatalogDefaults,
  readSnapshotFromFile,
  saveSnapshotToStorage,
  stripWorkspaceQueryParam,
  type WorkspaceSnapshot,
} from "@/lib/persistence";
import {
  fetchSavedDataFromServer,
  saveDataToServer,
} from "@/lib/workspaceApi";

export type PersistenceMode = "server" | "local";

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
  persistenceMode: PersistenceMode;
  /** ISO timestamp of the last successful save, or null. */
  lastSavedAt: string | null;
  /** True after the initial hydrate attempt finishes. */
  hydrated: boolean;
  /** Persist current data to cloud (with local cache). */
  saveWorkspace: () => Promise<{
    savedAt: string;
    mode: PersistenceMode;
  } | null>;
  /** Restore data from cloud (fallback to local cache). */
  loadWorkspace: () => Promise<boolean>;
  /** Download current data as a JSON file. */
  exportWorkspace: () => void;
  /** Load data from an exported JSON file. */
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
  const merged = mergeCatalogDefaults(snapshot);
  setters.setNouns(merged.nouns);
  setters.setDeliveryVerbs(merged.deliveryVerbs);
  setters.setModifierVerbs(merged.modifierVerbs);
  setters.setConfig(merged.config);
  setters.setLastSavedAt(merged.savedAt);
}

export function SpellConfigProvider({ children }: { children: ReactNode }) {
  const [nouns, setNouns] = useState<Noun[]>(defaultNouns);
  const [deliveryVerbs, setDeliveryVerbs] =
    useState<DeliveryVerb[]>(defaultDeliveryVerbs);
  const [modifierVerbs, setModifierVerbs] =
    useState<ModifierVerb[]>(defaultModifierVerbs);
  const [config, setConfig] = useState<GlobalConfig>(defaultGlobalConfig);
  const [persistenceMode, setPersistenceMode] =
    useState<PersistenceMode>("local");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      stripWorkspaceQueryParam();

      const serverResult = await fetchSavedDataFromServer();
      if (cancelled) return;

      if (serverResult !== "missing" && serverResult !== "error") {
        applySnapshot(serverResult, {
          setNouns,
          setDeliveryVerbs,
          setModifierVerbs,
          setConfig,
          setLastSavedAt,
        });
        saveSnapshotToStorage(serverResult);
        setPersistenceMode("server");
        setHydrated(true);
        return;
      }

      const cached = loadSnapshotFromStorage();
      if (cached) {
        applySnapshot(cached, {
          setNouns,
          setDeliveryVerbs,
          setModifierVerbs,
          setConfig,
          setLastSavedAt,
        });
      }
      setPersistenceMode(serverResult === "error" ? "local" : "server");
      setHydrated(true);
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
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
    setLastSavedAt(null);
  }

  const saveWorkspace = useCallback(async () => {
    const snapshot = createSnapshot({
      nouns,
      deliveryVerbs,
      modifierVerbs,
      config,
    });

    saveSnapshotToStorage(snapshot);
    setLastSavedAt(snapshot.savedAt);

    const savedToServer = await saveDataToServer(snapshot);
    const mode: PersistenceMode = savedToServer ? "server" : "local";
    setPersistenceMode(mode);
    return { savedAt: snapshot.savedAt, mode };
  }, [nouns, deliveryVerbs, modifierVerbs, config]);

  const loadWorkspace = useCallback(async () => {
    const serverResult = await fetchSavedDataFromServer();
    if (serverResult !== "missing" && serverResult !== "error") {
      applySnapshot(serverResult, {
        setNouns,
        setDeliveryVerbs,
        setModifierVerbs,
        setConfig,
        setLastSavedAt,
      });
      saveSnapshotToStorage(serverResult);
      setPersistenceMode("server");
      return true;
    }

    const cached = loadSnapshotFromStorage();
    if (!cached) return false;

    applySnapshot(cached, {
      setNouns,
      setDeliveryVerbs,
      setModifierVerbs,
      setConfig,
      setLastSavedAt,
    });
    setPersistenceMode(serverResult === "error" ? "local" : "server");
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

    const savedToServer = await saveDataToServer(snapshot);
    setPersistenceMode(savedToServer ? "server" : "local");
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
        persistenceMode,
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

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
  type WorkspaceSnapshot,
} from "@/lib/persistence";
import { ensureWorkspaceId } from "@/lib/workspaceId";
import {
  fetchWorkspaceFromServer,
  saveWorkspaceToServer,
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
  workspaceId: string | null;
  persistenceMode: PersistenceMode;
  /** ISO timestamp of the last successful save, or null. */
  lastSavedAt: string | null;
  /** True after the initial hydrate attempt finishes. */
  hydrated: boolean;
  /** Persist current workspace to KV (with local cache). */
  saveWorkspace: () => Promise<{
    savedAt: string;
    mode: PersistenceMode;
  } | null>;
  /** Restore workspace from KV (fallback to local cache). */
  loadWorkspace: () => Promise<boolean>;
  /** Download current workspace as a JSON file. */
  exportWorkspace: () => void;
  /** Load workspace from an exported JSON file. */
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
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [persistenceMode, setPersistenceMode] =
    useState<PersistenceMode>("local");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const id = ensureWorkspaceId();
      if (cancelled) return;
      setWorkspaceId(id);

      const serverResult = await fetchWorkspaceFromServer(id);
      if (cancelled) return;

      if (serverResult !== "missing" && serverResult !== "error") {
        applySnapshot(serverResult, {
          setNouns,
          setDeliveryVerbs,
          setModifierVerbs,
          setConfig,
          setLastSavedAt,
        });
        saveSnapshotToStorage(serverResult, id);
        setPersistenceMode("server");
        setHydrated(true);
        return;
      }

      const cached = loadSnapshotFromStorage(id);
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
    if (!workspaceId) return null;

    const snapshot = createSnapshot({
      nouns,
      deliveryVerbs,
      modifierVerbs,
      config,
    });

    saveSnapshotToStorage(snapshot, workspaceId);
    setLastSavedAt(snapshot.savedAt);

    const savedToServer = await saveWorkspaceToServer(workspaceId, snapshot);
    const mode: PersistenceMode = savedToServer ? "server" : "local";
    setPersistenceMode(mode);
    return { savedAt: snapshot.savedAt, mode };
  }, [nouns, deliveryVerbs, modifierVerbs, config, workspaceId]);

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return false;

    const serverResult = await fetchWorkspaceFromServer(workspaceId);
    if (serverResult !== "missing" && serverResult !== "error") {
      applySnapshot(serverResult, {
        setNouns,
        setDeliveryVerbs,
        setModifierVerbs,
        setConfig,
        setLastSavedAt,
      });
      saveSnapshotToStorage(serverResult, workspaceId);
      setPersistenceMode("server");
      return true;
    }

    const cached = loadSnapshotFromStorage(workspaceId);
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
  }, [workspaceId]);

  const exportWorkspace = useCallback(() => {
    const snapshot = createSnapshot({
      nouns,
      deliveryVerbs,
      modifierVerbs,
      config,
    });
    downloadSnapshot(snapshot);
  }, [nouns, deliveryVerbs, modifierVerbs, config]);

  const importWorkspace = useCallback(
    async (file: File) => {
      if (!workspaceId) return false;

      const snapshot = await readSnapshotFromFile(file);
      if (!snapshot) return false;

      applySnapshot(snapshot, {
        setNouns,
        setDeliveryVerbs,
        setModifierVerbs,
        setConfig,
        setLastSavedAt,
      });
      saveSnapshotToStorage(snapshot, workspaceId);

      const savedToServer = await saveWorkspaceToServer(workspaceId, snapshot);
      setPersistenceMode(savedToServer ? "server" : "local");
      return true;
    },
    [workspaceId]
  );

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
        workspaceId,
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

import type {
  Noun,
  DeliveryVerb,
  ModifierVerb,
  GlobalConfig,
} from "@/lib/types";
import {
  defaultDeliveryVerbs,
  defaultGlobalConfig,
  defaultModifierVerbs,
  defaultNouns,
} from "@/lib/defaultData";

export const STORAGE_KEY = "spell-calculator:data:v1";
const LEGACY_STORAGE_PREFIX = "spell-calculator:workspace:v1:";

export type WorkspaceSnapshot = {
  version: 1;
  savedAt: string;
  nouns: Noun[];
  deliveryVerbs: DeliveryVerb[];
  modifierVerbs: ModifierVerb[];
  config: GlobalConfig;
};

export function createSnapshot(data: {
  nouns: Noun[];
  deliveryVerbs: DeliveryVerb[];
  modifierVerbs: ModifierVerb[];
  config: GlobalConfig;
}): WorkspaceSnapshot {
  return {
    version: 1,
    savedAt: new Date().toISOString(),
    nouns: data.nouns,
    deliveryVerbs: data.deliveryVerbs,
    modifierVerbs: data.modifierVerbs,
    config: data.config,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNounArray(value: unknown): value is Noun[] {
  return Array.isArray(value) && value.every((item) => isObject(item) && typeof item.id === "string");
}

function isDeliveryArray(value: unknown): value is DeliveryVerb[] {
  return Array.isArray(value) && value.every((item) => isObject(item) && typeof item.id === "string");
}

function isModifierArray(value: unknown): value is ModifierVerb[] {
  return Array.isArray(value) && value.every((item) => isObject(item) && typeof item.id === "string");
}

function normalizeNoun(noun: Noun): Noun {
  return {
    ...noun,
    enabled: noun.enabled !== false,
  };
}

function normalizeDelivery(verb: DeliveryVerb): DeliveryVerb {
  return {
    ...verb,
    enabled: verb.enabled !== false,
  };
}

function normalizeModifier(mod: ModifierVerb): ModifierVerb {
  return {
    ...mod,
    enabled: mod.enabled !== false,
    repeatAllowed: mod.repeatAllowed !== false,
  };
}

/** Append catalog defaults that are missing by id; never overwrite saved edits. */
function mergeMissingById<T extends { id: string }>(
  saved: T[],
  defaults: T[]
): T[] {
  const present = new Set(saved.map((item) => item.id));
  const missing = defaults.filter((item) => !present.has(item.id));
  return missing.length === 0 ? saved : [...saved, ...missing];
}

/**
 * Keep the user's saved values, but pull in any new default nouns/verbs/config
 * keys that were added to the app after this snapshot was saved/exported.
 */
export function mergeCatalogDefaults(
  snapshot: WorkspaceSnapshot
): WorkspaceSnapshot {
  return {
    ...snapshot,
    nouns: mergeMissingById(snapshot.nouns, defaultNouns),
    deliveryVerbs: mergeMissingById(
      snapshot.deliveryVerbs,
      defaultDeliveryVerbs
    ),
    modifierVerbs: mergeMissingById(
      snapshot.modifierVerbs,
      defaultModifierVerbs
    ),
    config: { ...defaultGlobalConfig, ...snapshot.config },
  };
}

const REQUIRED_CONFIG_KEYS: (keyof GlobalConfig)[] = [
  "manaMultiplier",
  "castTimeMultiplier",
  "manaExponent",
  "timeExponent",
  "maxRepeatPerModifier",
  "maxTotalModifiers",
  "minTotalModifiers",
];

const OPTIONAL_RADAR_KEYS: (keyof GlobalConfig)[] = [
  "radarMaxCost",
  "radarMaxTime",
  "radarMaxImpact",
  "radarMaxEfficiency",
  "radarMaxDeliveryControl",
  "radarMaxStatusEffect",
  "radarEffectScoreSlow",
  "radarEffectScoreBurn",
  "radarSeekScoreYes",
  "radarSeekScoreNo",
  "radarHalfManaCost",
  "radarHalfManaPerSecond",
  "radarHalfCastTime",
  "radarHalfTotalDamage",
  "radarHalfDamagePerInstance",
  "radarHalfDamagePerMana",
  "radarHalfChainTargets",
  "radarHalfSplitStacks",
  "radarHalfEffectDuration",
  "radarHalfEffectPotency",
];

function normalizeGlobalConfig(value: unknown): GlobalConfig | null {
  if (!isObject(value)) return null;
  if (!REQUIRED_CONFIG_KEYS.every((key) => typeof value[key] === "number")) {
    return null;
  }

  const config = { ...defaultGlobalConfig };
  for (const key of REQUIRED_CONFIG_KEYS) {
    config[key] = value[key] as number;
  }
  for (const key of OPTIONAL_RADAR_KEYS) {
    if (typeof value[key] === "number") {
      config[key] = value[key] as number;
    }
  }
  return config;
}

export function parseSnapshot(raw: unknown): WorkspaceSnapshot | null {
  if (!isObject(raw)) return null;
  if (raw.version !== 1) return null;
  if (typeof raw.savedAt !== "string") return null;
  if (!isNounArray(raw.nouns)) return null;
  if (!isDeliveryArray(raw.deliveryVerbs)) return null;
  if (!isModifierArray(raw.modifierVerbs)) return null;
  const config = normalizeGlobalConfig(raw.config);
  if (!config) return null;

  return mergeCatalogDefaults({
    version: 1,
    savedAt: raw.savedAt,
    nouns: raw.nouns.map(normalizeNoun),
    deliveryVerbs: raw.deliveryVerbs.map(normalizeDelivery),
    modifierVerbs: raw.modifierVerbs.map(normalizeModifier),
    config,
  });
}

function loadLegacySnapshotFromStorage(): WorkspaceSnapshot | null {
  let best: WorkspaceSnapshot | null = null;
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(LEGACY_STORAGE_PREFIX)) continue;
    try {
      const snapshot = parseSnapshot(JSON.parse(window.localStorage.getItem(key) ?? ""));
      if (!snapshot) continue;
      if (!best || snapshot.savedAt > best.savedAt) best = snapshot;
    } catch {
      // ignore corrupt legacy entries
    }
  }
  return best;
}

export function loadSnapshotFromStorage(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const snapshot = parseSnapshot(JSON.parse(raw));
      if (snapshot) return snapshot;
    }
    return loadLegacySnapshotFromStorage();
  } catch {
    return null;
  }
}

export function saveSnapshotToStorage(snapshot: WorkspaceSnapshot): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearSnapshotFromStorage(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function downloadSnapshot(snapshot: WorkspaceSnapshot, filename?: string): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download =
    filename ??
    `spell-calculator-${snapshot.savedAt.slice(0, 19).replace(/[:T]/g, "-")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Parse a JSON string from an exported save file. */
export function parseSnapshotJson(text: string): WorkspaceSnapshot | null {
  try {
    return parseSnapshot(JSON.parse(text));
  } catch {
    return null;
  }
}

export function readSnapshotFromFile(file: File): Promise<WorkspaceSnapshot | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        resolve(null);
        return;
      }
      resolve(parseSnapshotJson(reader.result));
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

export function formatSavedAt(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}

/** Drop leftover ?workspace= ids from older builds. */
export function stripWorkspaceQueryParam(): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("workspace")) return;
  url.searchParams.delete("workspace");
  window.history.replaceState(null, "", url.toString());
}

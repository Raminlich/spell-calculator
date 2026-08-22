import type {
  Noun,
  DeliveryVerb,
  ModifierVerb,
  GlobalConfig,
} from "@/lib/types";

export const STORAGE_KEY = "spell-calculator:workspace:v1";

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

function normalizeModifier(mod: ModifierVerb): ModifierVerb {
  return {
    ...mod,
    repeatAllowed: mod.repeatAllowed !== false,
  };
}

function isGlobalConfig(value: unknown): value is GlobalConfig {
  if (!isObject(value)) return false;
  const keys: (keyof GlobalConfig)[] = [
    "manaMultiplier",
    "castTimeMultiplier",
    "manaExponent",
    "timeExponent",
    "maxRepeatPerModifier",
    "maxTotalModifiers",
    "minTotalModifiers",
  ];
  return keys.every((key) => typeof value[key] === "number");
}

export function parseSnapshot(raw: unknown): WorkspaceSnapshot | null {
  if (!isObject(raw)) return null;
  if (raw.version !== 1) return null;
  if (typeof raw.savedAt !== "string") return null;
  if (!isNounArray(raw.nouns)) return null;
  if (!isDeliveryArray(raw.deliveryVerbs)) return null;
  if (!isModifierArray(raw.modifierVerbs)) return null;
  if (!isGlobalConfig(raw.config)) return null;

  return {
    version: 1,
    savedAt: raw.savedAt,
    nouns: raw.nouns,
    deliveryVerbs: raw.deliveryVerbs,
    modifierVerbs: raw.modifierVerbs.map(normalizeModifier),
    config: raw.config,
  };
}

export function loadSnapshotFromStorage(): WorkspaceSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return parseSnapshot(JSON.parse(raw));
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

/** Parse a JSON string from an exported workspace file. */
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

import type { GlobalConfig, ModifierCount, ModifierVerb } from "./types";

export function totalModifierStacks(counts: ModifierCount): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0);
}

/**
 * When minTotalModifiers > 0, seed stacks on the first repeat-allowed
 * modifier (else the first modifier) up to min / repeat / total caps.
 */
export function defaultModifierCounts(
  modifiers: ModifierVerb[],
  config: GlobalConfig
): ModifierCount {
  const min = Math.max(0, config.minTotalModifiers);
  if (min === 0 || modifiers.length === 0) return {};

  const preferred =
    modifiers.find((m) => m.repeatAllowed !== false) ?? modifiers[0];
  const repeatCap =
    preferred.repeatAllowed === false ? 1 : config.maxRepeatPerModifier;
  const count = Math.min(min, repeatCap, config.maxTotalModifiers);
  return count > 0 ? { [preferred.id]: count } : {};
}

export function canIncrementModifier(
  id: string,
  counts: ModifierCount,
  modifiersById: Map<string, ModifierVerb>,
  config: GlobalConfig
): boolean {
  const mod = modifiersById.get(id);
  if (!mod) return false;
  const current = counts[id] ?? 0;
  const repeatCap =
    mod.repeatAllowed === false ? 1 : config.maxRepeatPerModifier;
  if (current >= repeatCap) return false;
  if (totalModifierStacks(counts) >= config.maxTotalModifiers) return false;
  return true;
}

export function canDecrementModifier(
  id: string,
  counts: ModifierCount
): boolean {
  return (counts[id] ?? 0) > 0;
}

export function incrementModifier(
  id: string,
  counts: ModifierCount,
  modifiersById: Map<string, ModifierVerb>,
  config: GlobalConfig
): ModifierCount {
  if (!canIncrementModifier(id, counts, modifiersById, config)) return counts;
  return { ...counts, [id]: (counts[id] ?? 0) + 1 };
}

export function decrementModifier(
  id: string,
  counts: ModifierCount
): ModifierCount {
  const current = counts[id] ?? 0;
  if (current <= 0) return counts;
  if (current === 1) {
    const next = { ...counts };
    delete next[id];
    return next;
  }
  return { ...counts, [id]: current - 1 };
}

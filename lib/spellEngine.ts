import {
  Noun,
  DeliveryVerb,
  ModifierVerb,
  GlobalConfig,
  ModifierCount,
  SpellCombo,
} from "./types";
import { MAX_COMBOS_SAFETY_CAP } from "./defaultData";

/**
 * Sum of base * growth^(n-1) for n = 1..count.
 * growth = 1 means flat linear cost (no exponential penalty).
 */
function stackedCost(base: number, count: number, growth: number): number {
  if (count <= 0) return 0;
  let total = 0;
  for (let n = 1; n <= count; n++) {
    total += base * Math.pow(growth, n - 1);
  }
  return total;
}

/**
 * Enumerate every possible count-map across `modifiers`, where each modifier
 * can appear 0..maxRepeatPerModifier times, and the total stacked modifier
 * count across all types falls within [minTotal, maxTotal].
 */
export function generateModifierCountMaps(
  modifiers: ModifierVerb[],
  maxRepeatPerModifier: number,
  minTotal: number,
  maxTotal: number
): ModifierCount[] {
  const results: ModifierCount[] = [];

  function recurse(index: number, current: ModifierCount, runningTotal: number) {
    if (index === modifiers.length) {
      if (runningTotal >= minTotal && runningTotal <= maxTotal) {
        results.push({ ...current });
      }
      return;
    }
    const mod = modifiers[index];
    const remainingBudget = maxTotal - runningTotal;
    const cap = Math.min(maxRepeatPerModifier, remainingBudget);
    for (let count = 0; count <= cap; count++) {
      if (count > 0) current[mod.id] = count;
      else delete current[mod.id];
      recurse(index + 1, current, runningTotal + count);
      if (results.length > MAX_COMBOS_SAFETY_CAP) return; // bail out early
    }
  }

  recurse(0, {}, 0);
  return results;
}

function buildLabel(
  noun: Noun,
  delivery: DeliveryVerb,
  modifierList: { modifier: ModifierVerb; count: number }[]
): string {
  const parts = [noun.name, delivery.name];
  for (const { modifier, count } of modifierList) {
    parts.push(count > 1 ? `${modifier.name} x${count}` : modifier.name);
  }
  return parts.join(" + ");
}

export function computeSpellCombo(
  noun: Noun,
  delivery: DeliveryVerb,
  modifierCounts: ModifierCount,
  modifiersById: Map<string, ModifierVerb>,
  config: GlobalConfig
): SpellCombo {
  const modifierList = Object.entries(modifierCounts)
    .filter(([, count]) => count > 0)
    .map(([id, count]) => ({ modifier: modifiersById.get(id)!, count }))
    .sort((a, b) => a.modifier.name.localeCompare(b.modifier.name));

  const totalModifiers = modifierList.reduce((sum, m) => sum + m.count, 0);

  let modifierManaCost = 0;
  let modifierCastTime = 0;
  let potencyPool = noun.potency;
  let instances = delivery.baseInstances;

  for (const { modifier, count } of modifierList) {
    modifierManaCost += stackedCost(modifier.manaCost, count, config.manaExponent);
    modifierCastTime += stackedCost(modifier.castTime, count, config.timeExponent);
    potencyPool *= Math.pow(modifier.potencyMultiplier, count);
    instances *= Math.pow(modifier.instanceMultiplier, count);
  }

  const manaCost =
    config.manaMultiplier * (noun.manaCost + delivery.manaCost + modifierManaCost);
  const castTime =
    config.castTimeMultiplier * (noun.castTime + delivery.castTime + modifierCastTime);
  const potencyPerInstance = instances > 0 ? potencyPool / instances : potencyPool;

  const key = `${noun.id}|${delivery.id}|${JSON.stringify(
    Object.entries(modifierCounts).sort()
  )}`;

  return {
    key,
    noun,
    delivery,
    modifierCounts,
    modifierList,
    totalModifiers,
    manaCost,
    castTime,
    instances,
    potencyPool,
    potencyPerInstance,
    label: buildLabel(noun, delivery, modifierList),
  };
}

export function generateAllCombos(
  nouns: Noun[],
  deliveryVerbs: DeliveryVerb[],
  modifierVerbs: ModifierVerb[],
  config: GlobalConfig
): { combos: SpellCombo[]; truncated: boolean } {
  const modifierCountMaps = generateModifierCountMaps(
    modifierVerbs,
    config.maxRepeatPerModifier,
    config.minTotalModifiers,
    config.maxTotalModifiers
  );
  const modifiersById = new Map(modifierVerbs.map((m) => [m.id, m]));

  const combos: SpellCombo[] = [];
  let truncated = false;

  outer: for (const noun of nouns) {
    for (const delivery of deliveryVerbs) {
      for (const modifierCounts of modifierCountMaps) {
        if (combos.length >= MAX_COMBOS_SAFETY_CAP) {
          truncated = true;
          break outer;
        }
        combos.push(
          computeSpellCombo(noun, delivery, modifierCounts, modifiersById, config)
        );
      }
    }
  }

  return { combos, truncated };
}

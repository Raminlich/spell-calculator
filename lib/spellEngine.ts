import {
  Noun,
  DeliveryVerb,
  ModifierVerb,
  GlobalConfig,
  ModifierCount,
  SpellCombo,
  SpellEffectResult,
  StatusEffect,
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
 * can appear 0..cap times (cap = global maxRepeat when repeatAllowed, else 1),
 * and the total stacked modifier count across all types falls within
 * [minTotal, maxTotal].
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
    const repeatCap = mod.repeatAllowed === false ? 1 : maxRepeatPerModifier;
    const cap = Math.min(repeatCap, remainingBudget);
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

/**
 * Split relative potency gained above the noun base:
 * - bleed% of the relative gain multiplies effect strength
 * - remainder multiplies damage potency
 *
 * Example: Concentrate +50% with 100% bleed → effect strength ×1.5
 * (base 50% slow → 75% slow).
 */
export function splitPotencyGain(
  baseNounPotency: number,
  potencyPool: number,
  potencyBleedPercent: number
): {
  relativeGain: number;
  damagePotency: number;
  effectStrengthFactor: number;
} {
  const bleed = Math.min(100, Math.max(0, potencyBleedPercent)) / 100;
  const relativeGain =
    baseNounPotency > 0
      ? Math.max(0, potencyPool - baseNounPotency) / baseNounPotency
      : 0;
  const effectStrengthFactor = 1 + relativeGain * bleed;
  const damagePotency =
    baseNounPotency * (1 + relativeGain * (1 - bleed));
  return { relativeGain, damagePotency, effectStrengthFactor };
}

/**
 * Effect potency is strength (how much stronger the effect is).
 * Final values scale from the base effect configured at base status potency.
 */
export function computeEffectResult(
  status: StatusEffect,
  effectStrengthFactor: number
): SpellEffectResult {
  const effectPotency = status.potency * effectStrengthFactor;
  const scale =
    status.potency > 0 ? effectPotency / status.potency : effectStrengthFactor;

  switch (status.kind) {
    case "burn":
      return {
        name: status.name,
        kind: "burn",
        potency: effectPotency,
        duration: status.duration,
        damage: status.damage * scale,
      };
    case "slow":
      return {
        name: status.name,
        kind: "slow",
        potency: effectPotency,
        duration: status.duration,
        slowAmountPercent: status.slowAmountPercent * scale,
      };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
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
  let seeksTarget = false;
  let chainExtraTargets = 0;
  let chainFalloffPercent = 0;
  let durationMultiplier = 1;

  for (const { modifier, count } of modifierList) {
    modifierManaCost += stackedCost(modifier.manaCost, count, config.manaExponent);
    modifierCastTime += stackedCost(modifier.castTime, count, config.timeExponent);

    if (modifier.potencyIncreasePercent != null) {
      const factor = 1 + modifier.potencyIncreasePercent / 100;
      potencyPool *= Math.pow(factor, count);
    }
    if (modifier.instanceMultiplier != null) {
      instances *= Math.pow(modifier.instanceMultiplier, count);
    }
    if (modifier.seeksTarget) {
      seeksTarget = true;
    }
    if (modifier.maxTargets != null) {
      chainExtraTargets += modifier.maxTargets * count;
      if (modifier.potencyFalloffPercent != null) {
        chainFalloffPercent = modifier.potencyFalloffPercent;
      }
    }
    if (modifier.durationMultiplier != null) {
      durationMultiplier *= Math.pow(modifier.durationMultiplier, count);
    }
  }

  const manaCost =
    config.manaMultiplier * (noun.manaCost + delivery.manaCost + modifierManaCost);
  const castTime =
    config.castTimeMultiplier * (noun.castTime + delivery.castTime + modifierCastTime);

  const { damagePotency, effectStrengthFactor } = splitPotencyGain(
    noun.potency,
    potencyPool,
    noun.statusEffect ? noun.potencyBleedPercent : 0
  );

  const potencyPerInstance = instances > 0 ? potencyPool / instances : potencyPool;
  const damagePotencyPerInstance =
    instances > 0 ? damagePotency / instances : damagePotency;
  const damageScale =
    noun.potency > 0 ? damagePotencyPerInstance / noun.potency : 1;
  const damagePerInstance = noun.damage * damageScale;

  // Split distributes effect strength across instances, same as damage potency.
  const effectStrengthPerInstance =
    instances > 0 ? effectStrengthFactor / instances : effectStrengthFactor;
  const effect = noun.statusEffect
    ? (() => {
        const result = computeEffectResult(
          noun.statusEffect,
          effectStrengthPerInstance
        );
        result.duration *= durationMultiplier;
        return result;
      })()
    : undefined;

  const chainTargets = 1 + chainExtraTargets;
  const falloffRetain = 1 - Math.min(100, Math.max(0, chainFalloffPercent)) / 100;
  const hops = Math.max(0, chainTargets - 1);
  const chainLastHopFactor =
    hops === 0 ? 1 : Math.pow(falloffRetain, hops);

  const directDamage = damagePerInstance * instances;
  const effectDamage =
    effect?.kind === "burn" ? (effect.damage ?? 0) * instances : 0;
  const totalDamage = directDamage + effectDamage;
  const damagePerMana = manaCost > 0 ? totalDamage / manaCost : 0;
  const manaPerSecond = castTime > 0 ? manaCost / castTime : 0;
  const potencyPerMana = manaCost > 0 ? potencyPool / manaCost : 0;
  const potencyPerSecond = castTime > 0 ? potencyPool / castTime : 0;
  const lastHopPotency = potencyPerInstance * chainLastHopFactor;

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
    seeksTarget,
    chainTargets,
    chainLastHopFactor,
    potencyPool,
    potencyPerInstance,
    potencyPerMana,
    potencyPerSecond,
    lastHopPotency,
    damagePerInstance,
    totalDamage,
    damagePerMana,
    manaPerSecond,
    effect,
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

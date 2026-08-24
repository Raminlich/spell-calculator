import { Noun, DeliveryVerb, ModifierVerb, GlobalConfig } from "./types";

export const defaultNouns: Noun[] = [
  {
    id: "fire",
    name: "Fire",
    description: "Direct damage. Deals damage over time.",
    manaCost: 20,
    castTime: 1.0,
    potency: 10,
    damage: 12,
    potencyBleedPercent: 50,
    statusEffect: {
      kind: "burn",
      name: "Burn",
      potency: 1,
      duration: 5,
      damage: 3,
    },
  },
  {
    id: "frost",
    name: "Frost",
    description: "Direct damage (weaker). Slows for a period of time.",
    manaCost: 15,
    castTime: 1.0,
    potency: 6,
    damage: 7,
    potencyBleedPercent: 80,
    statusEffect: {
      kind: "slow",
      name: "Slow",
      potency: 1,
      duration: 4,
      slowAmountPercent: 50,
    },
  },
  {
    id: "arcane",
    name: "Arcane",
    description: "Pure magical damage. No status effect.",
    manaCost: 18,
    castTime: 1.0,
    potency: 10,
    damage: 14,
    potencyBleedPercent: 0,
  },
];

export const defaultDeliveryVerbs: DeliveryVerb[] = [
  {
    id: "hurl",
    name: "Hurl",
    description: "Throws the spell as a gravity-affected projectile.",
    manaCost: 10,
    castTime: 0.5,
    baseInstances: 1,
  },
];

export const defaultModifierVerbs: ModifierVerb[] = [
  {
    id: "split",
    name: "Split",
    description:
      "Divides the spell into multiple instances. Damage and effect potency are distributed between all instances.",
    manaCost: 8,
    castTime: 0.3,
    repeatAllowed: true,
    instanceMultiplier: 2,
  },
  {
    id: "concentrate",
    name: "Concentrate",
    description:
      "Increases the main spell's potency, and effect potency relative to the noun.",
    manaCost: 12,
    castTime: 0.4,
    repeatAllowed: true,
    potencyIncreasePercent: 50,
  },
  {
    id: "seek",
    name: "Seek",
    description: "Causes the spell to arc toward a target.",
    manaCost: 6,
    castTime: 0.2,
    repeatAllowed: false,
    seeksTarget: true,
  },
  {
    id: "chain",
    name: "Chain",
    description:
      "Hops to the next close targets. More stacks hop to more targets, but each hop loses potency.",
    manaCost: 10,
    castTime: 0.35,
    repeatAllowed: true,
    maxTargets: 1,
    potencyFalloffPercent: 25,
  },
  {
    id: "saturate",
    name: "Saturate",
    description: "Increase the duration of any effects the spell currently has.",
    manaCost: 0,
    castTime: 0,
    repeatAllowed: true,
    durationMultiplier: 1.5,
  },
];

export const defaultGlobalConfig: GlobalConfig = {
  manaMultiplier: 1,
  castTimeMultiplier: 1,
  manaExponent: 1.5,
  timeExponent: 1.2,
  maxRepeatPerModifier: 3,
  maxTotalModifiers: 4,
  minTotalModifiers: 0,
  radarMaxCost: 10,
  radarMaxTime: 10,
  radarMaxImpact: 10,
  radarMaxEfficiency: 10,
  radarMaxDeliveryControl: 10,
  radarMaxStatusEffect: 10,
  radarEffectScoreSlow: 0.75,
  radarEffectScoreBurn: 0,
  radarSeekScoreYes: 1,
  radarSeekScoreNo: 0,
  radarHalfManaCost: 40,
  radarHalfManaPerSecond: 30,
  radarHalfCastTime: 1.5,
  radarHalfTotalDamage: 40,
  radarHalfDamagePerInstance: 15,
  radarHalfDamagePerMana: 0.8,
  radarHalfChainTargets: 2,
  radarHalfSplitStacks: 1,
  radarHalfEffectDuration: 5,
  radarHalfEffectPotency: 1.5,
};

// Safety cap so the UI never tries to render an unreasonable number of rows.
export const MAX_COMBOS_SAFETY_CAP = 20000;

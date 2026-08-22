import { Noun, DeliveryVerb, ModifierVerb, GlobalConfig } from "./types";

export const defaultNouns: Noun[] = [
  {
    id: "fire",
    name: "Fire",
    description: "Direct damage. Deals damage over time.",
    manaCost: 20,
    castTime: 1.0,
    potency: 10,
  },
  {
    id: "frost",
    name: "Frost",
    description: "Direct damage (weaker). Slows for a period of time.",
    manaCost: 15,
    castTime: 1.0,
    potency: 6,
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
      "Divides the spell into multiple instances. Potency is distributed between all instances.",
    manaCost: 8,
    castTime: 0.3,
    potencyMultiplier: 1,
    instanceMultiplier: 2,
  },
  {
    id: "concentrate",
    name: "Concentrate",
    description:
      "Increases the main spell's potency, and effect potency relative to the noun.",
    manaCost: 12,
    castTime: 0.4,
    potencyMultiplier: 1.5,
    instanceMultiplier: 1,
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
};

// Safety cap so the UI never tries to render an unreasonable number of rows.
export const MAX_COMBOS_SAFETY_CAP = 20000;

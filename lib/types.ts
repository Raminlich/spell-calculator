export type Noun = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  potency: number; // base potency pool granted by this noun
};

export type DeliveryVerb = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  baseInstances: number; // number of spell instances this delivery produces by default
};

export type ModifierVerb = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  // Multiplier applied to the potency pool, per stack (1 = no effect)
  potencyMultiplier: number;
  // Multiplier applied to instance count, per stack (1 = no effect)
  instanceMultiplier: number;
};

export type GlobalConfig = {
  manaMultiplier: number;
  castTimeMultiplier: number;
  manaExponent: number; // growth base for repeating a modifier's mana cost
  timeExponent: number; // growth base for repeating a modifier's cast time
  maxRepeatPerModifier: number; // cap on how many times a single modifier can stack
  maxTotalModifiers: number; // cap on total modifier count in one spell
  minTotalModifiers: number; // floor on total modifier count in one spell
};

export type ModifierCount = Record<string, number>; // modifierId -> stack count

export type SpellCombo = {
  key: string;
  noun: Noun;
  delivery: DeliveryVerb;
  modifierCounts: ModifierCount;
  modifierList: { modifier: ModifierVerb; count: number }[];
  totalModifiers: number;
  manaCost: number;
  castTime: number;
  instances: number;
  potencyPool: number;
  potencyPerInstance: number;
  label: string;
};

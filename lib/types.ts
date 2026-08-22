export type BurnStatusEffect = {
  kind: "burn";
  name: string;
  /** Base effect strength (usually 1). Final burn damage scales with this. */
  potency: number;
  duration: number;
  /** Burn damage at base effect potency. */
  damage: number;
};

export type SlowStatusEffect = {
  kind: "slow";
  name: string;
  /** Base effect strength (usually 1). Final slow % scales with this. */
  potency: number;
  duration: number;
  /** Slow amount % at base effect potency (e.g. 50 at potency 1). */
  slowAmountPercent: number;
};

export type StatusEffect = BurnStatusEffect | SlowStatusEffect;

export type Noun = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  /** Base potency pool granted by this noun. */
  potency: number;
  /** Base direct damage per instance at base potency. */
  damage: number;
  /**
   * Of potency gained above the noun's base potency, this percent goes to the
   * status effect; the remainder stays on damage.
   * e.g. 80 means 80% of the gain → effect, 20% → damage.
   */
  potencyBleedPercent: number;
  statusEffect: StatusEffect;
};

export type DeliveryVerb = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  /** Number of spell instances this delivery produces by default. */
  baseInstances: number;
};

/**
 * Modifier verbs only set the fields they affect.
 * Split: instanceMultiplier
 * Concentrate: potencyIncreasePercent
 * Seek: seeksTarget
 * Chain: maxTargets + potencyFalloffPercent
 * Saturate: durationMultiplier
 */
export type ModifierVerb = {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  castTime: number;
  /**
   * When true, this modifier may stack up to the global max-repeats cap.
   * When false, it may appear at most once in a spell.
   */
  repeatAllowed: boolean;
  /** Percent potency increase per stack (e.g. 50 = +50% / stack). */
  potencyIncreasePercent?: number;
  /** Multiplier applied to instance count per stack. */
  instanceMultiplier?: number;
  /** Seek: spell arcs toward a target. */
  seeksTarget?: boolean;
  /** Chain: additional hop targets granted per stack. */
  maxTargets?: number;
  /** Chain: percent of potency lost on each hop. */
  potencyFalloffPercent?: number;
  /** Saturate: multiply status-effect duration per stack. */
  durationMultiplier?: number;
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

export type SpellEffectResult = {
  name: string;
  kind: StatusEffect["kind"];
  /**
   * Effect strength after bleed (e.g. 1.5 = 50% stronger than base).
   * Final burn damage / slow % = base value × (potency / baseStatusPotency).
   */
  potency: number;
  duration: number;
  /** Burn: final damage after scaling by effect potency. */
  damage?: number;
  /** Slow: final slow amount % after scaling by effect potency. */
  slowAmountPercent?: number;
};

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
  /** True when Seek (or another seeking modifier) is present. */
  seeksTarget: boolean;
  /** Total targets including primary hit (Chain adds hops). */
  chainTargets: number;
  /** Potency retained on the last hop (1 = full / no chain). */
  chainLastHopFactor: number;
  potencyPool: number;
  potencyPerInstance: number;
  /** Potency pool ÷ mana cost. */
  potencyPerMana: number;
  /** Potency pool ÷ cast time. */
  potencyPerSecond: number;
  /** Potency retained on the last chain hop. */
  lastHopPotency: number;
  damagePerInstance: number;
  /** Direct damage + effect (burn) damage across all instances. */
  totalDamage: number;
  /** Total damage ÷ mana cost. */
  damagePerMana: number;
  /** Mana cost ÷ cast time. */
  manaPerSecond: number;
  effect: SpellEffectResult;
  label: string;
};

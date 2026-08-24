import type { SpellCombo } from "@/lib/types";

export type RadarAxisId =
  | "cost"
  | "time"
  | "impact"
  | "efficiency"
  | "deliveryControl"
  | "statusEffect";

export const RADAR_AXIS_OPTIONS: {
  id: RadarAxisId;
  label: string;
  shortLabel: string;
}[] = [
  { id: "cost", label: "Affordability", shortLabel: "Afford." },
  { id: "time", label: "Speed", shortLabel: "Speed" },
  { id: "impact", label: "Impact", shortLabel: "Impact" },
  { id: "efficiency", label: "Efficiency", shortLabel: "Eff." },
  { id: "deliveryControl", label: "Control", shortLabel: "Control" },
  { id: "statusEffect", label: "Status Effect", shortLabel: "Status" },
];

/** Allowlisted numeric / derived inputs for radar metrics. */
export const RADAR_SOURCE_OPTIONS = [
  { id: "manaCost", label: "Mana cost" },
  { id: "manaPerSecond", label: "Mana / second" },
  { id: "castTime", label: "Cast time" },
  { id: "totalDamage", label: "Total damage" },
  { id: "damagePerInstance", label: "Damage / instance" },
  { id: "damagePerMana", label: "Damage / mana" },
  { id: "chainTargets", label: "Chain targets" },
  { id: "lastHopPotency", label: "Last-hop potency" },
  { id: "potencyPool", label: "Potency pool" },
  { id: "potencyPerInstance", label: "Potency / instance" },
  { id: "instances", label: "Instances" },
  { id: "effectDuration", label: "Effect duration" },
  { id: "effectPotency", label: "Effect potency" },
  { id: "seeksTarget", label: "Seek (boolean)" },
  { id: "effectKind", label: "Effect kind" },
  { id: "deliveryId", label: "Delivery" },
  { id: "modifierStacks", label: "Modifier stacks" },
] as const;

export type RadarSourceId = (typeof RADAR_SOURCE_OPTIONS)[number]["id"];

const SOURCE_IDS = new Set<string>(RADAR_SOURCE_OPTIONS.map((s) => s.id));

export type RadarMetricBase = {
  id: string;
  axisId: RadarAxisId;
  label: string;
  enabled: boolean;
  source: RadarSourceId;
  /** Required when source is modifierStacks. */
  modifierId?: string;
};

export type RadarMetricHigherBetter = RadarMetricBase & {
  curve: "higherBetter";
  halfAt: number;
  /** Unit score when the resolved value is 0 / missing. Default 0. */
  whenZero?: number;
};

export type RadarMetricLowerBetter = RadarMetricBase & {
  curve: "lowerBetter";
  halfAt: number;
  /** Unit score when value is missing / non-positive and castTime-style gaps. Default 0.5 for mana/s legacy. */
  whenMissing?: number;
};

export type RadarMetricBooleanMap = RadarMetricBase & {
  curve: "booleanMap";
  whenTrue: number;
  whenFalse: number;
};

export type RadarMetricEnumMap = RadarMetricBase & {
  curve: "enumMap";
  values: Record<string, number>;
};

/** Score when resolved enum key equals matchKey; otherwise whenNoMatch. */
export type RadarMetricMatchOne = RadarMetricBase & {
  curve: "matchOne";
  matchKey: string;
  whenMatch: number;
  whenNoMatch: number;
};

export type RadarMetric =
  | RadarMetricHigherBetter
  | RadarMetricLowerBetter
  | RadarMetricBooleanMap
  | RadarMetricEnumMap
  | RadarMetricMatchOne;

export const AXIS_MAX_WEIGHT_KEY: Record<
  RadarAxisId,
  | "radarMaxCost"
  | "radarMaxTime"
  | "radarMaxImpact"
  | "radarMaxEfficiency"
  | "radarMaxDeliveryControl"
  | "radarMaxStatusEffect"
> = {
  cost: "radarMaxCost",
  time: "radarMaxTime",
  impact: "radarMaxImpact",
  efficiency: "radarMaxEfficiency",
  deliveryControl: "radarMaxDeliveryControl",
  statusEffect: "radarMaxStatusEffect",
};

export const defaultRadarMetrics: RadarMetric[] = [
  {
    id: "cost-mana-cost",
    axisId: "cost",
    label: "Mana Cost",
    enabled: true,
    source: "manaCost",
    curve: "lowerBetter",
    halfAt: 40,
  },
  {
    id: "cost-mana-per-second",
    axisId: "cost",
    label: "Mana / Second",
    enabled: true,
    source: "manaPerSecond",
    curve: "lowerBetter",
    halfAt: 30,
    whenMissing: 0.5,
  },
  {
    id: "time-cast-time",
    axisId: "time",
    label: "Cast Time",
    enabled: true,
    source: "castTime",
    curve: "lowerBetter",
    halfAt: 1.5,
  },
  {
    id: "impact-total-damage",
    axisId: "impact",
    label: "Total Damage",
    enabled: true,
    source: "totalDamage",
    curve: "higherBetter",
    halfAt: 40,
  },
  {
    id: "impact-damage-per-instance",
    axisId: "impact",
    label: "Damage / Instance",
    enabled: true,
    source: "damagePerInstance",
    curve: "higherBetter",
    halfAt: 15,
  },
  {
    id: "efficiency-damage-per-mana",
    axisId: "efficiency",
    label: "Damage / Mana",
    enabled: true,
    source: "damagePerMana",
    curve: "higherBetter",
    halfAt: 0.8,
    whenZero: 0,
  },
  {
    id: "control-seek",
    axisId: "deliveryControl",
    label: "Seek",
    enabled: true,
    source: "seeksTarget",
    curve: "booleanMap",
    whenTrue: 1,
    whenFalse: 0,
  },
  {
    id: "control-targets",
    axisId: "deliveryControl",
    label: "Targets",
    enabled: true,
    source: "chainTargets",
    curve: "higherBetter",
    halfAt: 2,
  },
  {
    id: "control-split",
    axisId: "deliveryControl",
    label: "Split",
    enabled: true,
    source: "modifierStacks",
    modifierId: "split",
    curve: "higherBetter",
    halfAt: 1,
    whenZero: 0,
  },
  {
    id: "control-effect-slow",
    axisId: "deliveryControl",
    label: "Slow effect",
    enabled: true,
    source: "effectKind",
    curve: "matchOne",
    matchKey: "slow",
    whenMatch: 0.75,
    whenNoMatch: 0,
  },
  {
    id: "status-duration",
    axisId: "statusEffect",
    label: "Duration",
    enabled: true,
    source: "effectDuration",
    curve: "higherBetter",
    halfAt: 5,
    whenZero: 0,
  },
  {
    id: "status-effect-potency",
    axisId: "statusEffect",
    label: "Effect Potency",
    enabled: true,
    source: "effectPotency",
    curve: "higherBetter",
    halfAt: 1.5,
    whenZero: 0,
  },
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function higherBetter(value: number, halfAt: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (halfAt <= 0) return 1;
  return value / (value + halfAt);
}

function lowerBetter(value: number, halfAt: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (halfAt <= 0) return 0;
  return halfAt / (value + halfAt);
}

function isRadarAxisId(value: unknown): value is RadarAxisId {
  return (
    value === "cost" ||
    value === "time" ||
    value === "impact" ||
    value === "efficiency" ||
    value === "deliveryControl" ||
    value === "statusEffect"
  );
}

function isRadarSourceId(value: unknown): value is RadarSourceId {
  return typeof value === "string" && SOURCE_IDS.has(value);
}

/** Normalize / validate one metric; returns null if invalid. */
export function parseRadarMetric(raw: unknown): RadarMetric | null {
  if (!isObject(raw)) return null;
  if (typeof raw.id !== "string" || !raw.id) return null;
  if (!isRadarAxisId(raw.axisId)) return null;
  if (typeof raw.label !== "string") return null;
  if (!isRadarSourceId(raw.source)) return null;
  const enabled = raw.enabled !== false;
  const base = {
    id: raw.id,
    axisId: raw.axisId,
    label: raw.label,
    enabled,
    source: raw.source,
    ...(typeof raw.modifierId === "string" ? { modifierId: raw.modifierId } : {}),
  };

  if (raw.source === "modifierStacks" && typeof raw.modifierId !== "string") {
    return null;
  }

  const curve = raw.curve;
  if (curve === "higherBetter") {
    if (typeof raw.halfAt !== "number") return null;
    return {
      ...base,
      curve: "higherBetter",
      halfAt: raw.halfAt,
      ...(typeof raw.whenZero === "number" ? { whenZero: raw.whenZero } : {}),
    };
  }
  if (curve === "lowerBetter") {
    if (typeof raw.halfAt !== "number") return null;
    return {
      ...base,
      curve: "lowerBetter",
      halfAt: raw.halfAt,
      ...(typeof raw.whenMissing === "number"
        ? { whenMissing: raw.whenMissing }
        : {}),
    };
  }
  if (curve === "booleanMap") {
    if (typeof raw.whenTrue !== "number" || typeof raw.whenFalse !== "number") {
      return null;
    }
    return {
      ...base,
      curve: "booleanMap",
      whenTrue: raw.whenTrue,
      whenFalse: raw.whenFalse,
    };
  }
  if (curve === "enumMap") {
    if (!isObject(raw.values)) return null;
    const values: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw.values)) {
      if (typeof v === "number") values[k] = v;
    }
    return { ...base, curve: "enumMap", values };
  }
  if (curve === "matchOne") {
    if (typeof raw.matchKey !== "string" || !raw.matchKey) return null;
    if (typeof raw.whenMatch !== "number" || typeof raw.whenNoMatch !== "number") {
      return null;
    }
    return {
      ...base,
      curve: "matchOne",
      matchKey: raw.matchKey,
      whenMatch: raw.whenMatch,
      whenNoMatch: raw.whenNoMatch,
    };
  }
  return null;
}

export function parseRadarMetrics(raw: unknown): RadarMetric[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  const parsed: RadarMetric[] = [];
  for (const item of raw) {
    const metric = parseRadarMetric(item);
    if (metric) parsed.push(metric);
  }
  return parsed;
}

/**
 * Apply legacy GlobalConfig radar half/categorical keys onto metrics by id
 * (for saves from before radarMetrics existed).
 */
export function applyLegacyRadarConfig(
  metrics: RadarMetric[],
  legacy: Record<string, unknown>
): RadarMetric[] {
  const num = (key: string): number | undefined =>
    typeof legacy[key] === "number" ? (legacy[key] as number) : undefined;

  return metrics.map((metric) => {
    switch (metric.id) {
      case "cost-mana-cost": {
        const halfAt = num("radarHalfManaCost");
        return halfAt != null && metric.curve === "lowerBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "cost-mana-per-second": {
        const halfAt = num("radarHalfManaPerSecond");
        return halfAt != null && metric.curve === "lowerBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "time-cast-time": {
        const halfAt = num("radarHalfCastTime");
        return halfAt != null && metric.curve === "lowerBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "impact-total-damage": {
        const halfAt = num("radarHalfTotalDamage");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "impact-damage-per-instance": {
        const halfAt = num("radarHalfDamagePerInstance");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "efficiency-damage-per-mana": {
        const halfAt = num("radarHalfDamagePerMana");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "control-seek": {
        const whenTrue = num("radarSeekScoreYes");
        const whenFalse = num("radarSeekScoreNo");
        if (metric.curve !== "booleanMap") return metric;
        return {
          ...metric,
          whenTrue: whenTrue ?? metric.whenTrue,
          whenFalse: whenFalse ?? metric.whenFalse,
        };
      }
      case "control-targets": {
        const halfAt = num("radarHalfChainTargets");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "control-split": {
        const halfAt = num("radarHalfSplitStacks");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "control-effect-slow":
      case "control-effect-kind": {
        if (metric.curve === "matchOne") {
          const slow = num("radarEffectScoreSlow");
          return slow != null && metric.matchKey === "slow"
            ? { ...metric, whenMatch: slow }
            : metric;
        }
        if (metric.curve !== "enumMap") return metric;
        const slow = num("radarEffectScoreSlow");
        const burn = num("radarEffectScoreBurn");
        return {
          ...metric,
          values: {
            ...metric.values,
            ...(slow != null ? { slow } : {}),
            ...(burn != null ? { burn } : {}),
          },
        };
      }
      case "status-duration": {
        const halfAt = num("radarHalfEffectDuration");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      case "status-effect-potency": {
        const halfAt = num("radarHalfEffectPotency");
        return halfAt != null && metric.curve === "higherBetter"
          ? { ...metric, halfAt }
          : metric;
      }
      default:
        return metric;
    }
  });
}

type ResolvedSource = {
  raw: string;
  /** Numeric value for soft curves; NaN when N/A. */
  value: number;
  booleanValue?: boolean;
  enumKey?: string;
  missing?: boolean;
};

function resolveSource(
  combo: SpellCombo,
  metric: RadarMetric
): ResolvedSource {
  switch (metric.source) {
    case "manaCost":
      return { raw: combo.manaCost.toFixed(1), value: combo.manaCost };
    case "manaPerSecond":
      if (combo.castTime <= 0) {
        return { raw: "—", value: NaN, missing: true };
      }
      return {
        raw: combo.manaPerSecond.toFixed(2),
        value: combo.manaPerSecond,
      };
    case "castTime":
      return { raw: combo.castTime.toFixed(2) + "s", value: combo.castTime };
    case "totalDamage":
      return { raw: combo.totalDamage.toFixed(2), value: combo.totalDamage };
    case "damagePerInstance":
      return {
        raw: combo.damagePerInstance.toFixed(2),
        value: combo.damagePerInstance,
      };
    case "damagePerMana":
      if (combo.manaCost <= 0) {
        return { raw: "—", value: NaN, missing: true };
      }
      return {
        raw: combo.damagePerMana.toFixed(3),
        value: combo.damagePerMana,
      };
    case "chainTargets":
      return { raw: String(combo.chainTargets), value: combo.chainTargets };
    case "lastHopPotency":
      return {
        raw: combo.lastHopPotency.toFixed(2),
        value: combo.lastHopPotency,
      };
    case "potencyPool":
      return { raw: combo.potencyPool.toFixed(2), value: combo.potencyPool };
    case "potencyPerInstance":
      return {
        raw: combo.potencyPerInstance.toFixed(2),
        value: combo.potencyPerInstance,
      };
    case "instances":
      return { raw: String(combo.instances), value: combo.instances };
    case "effectDuration":
      if (!combo.effect) {
        return { raw: "—", value: 0, missing: true };
      }
      return {
        raw: combo.effect.duration.toFixed(1) + "s",
        value: combo.effect.duration,
      };
    case "effectPotency":
      if (!combo.effect) {
        return { raw: "—", value: 0, missing: true };
      }
      return {
        raw: combo.effect.potency.toFixed(2),
        value: combo.effect.potency,
      };
    case "seeksTarget":
      return {
        raw: combo.seeksTarget ? "yes" : "no",
        value: combo.seeksTarget ? 1 : 0,
        booleanValue: combo.seeksTarget,
      };
    case "effectKind": {
      const key = combo.effect?.kind ?? "none";
      return {
        raw: combo.effect?.name ?? "none",
        value: NaN,
        enumKey: key,
      };
    }
    case "deliveryId":
      return {
        raw: combo.delivery.name,
        value: NaN,
        enumKey: combo.delivery.id,
      };
    case "modifierStacks": {
      const stacks = combo.modifierCounts[metric.modifierId ?? ""] ?? 0;
      return {
        raw:
          stacks > 0
            ? `${stacks} stack${stacks > 1 ? "s" : ""}`
            : "none",
        value: stacks,
      };
    }
    default: {
      const _exhaustive: never = metric.source;
      return _exhaustive;
    }
  }
}

export function evaluateRadarMetric(
  combo: SpellCombo,
  metric: RadarMetric
): { label: string; raw: string; unit: number } {
  const resolved = resolveSource(combo, metric);

  switch (metric.curve) {
    case "higherBetter": {
      if (resolved.missing || !Number.isFinite(resolved.value) || resolved.value <= 0) {
        return {
          label: metric.label,
          raw: resolved.raw,
          unit: clamp01(metric.whenZero ?? 0),
        };
      }
      return {
        label: metric.label,
        raw: resolved.raw,
        unit: higherBetter(resolved.value, metric.halfAt),
      };
    }
    case "lowerBetter": {
      if (resolved.missing) {
        return {
          label: metric.label,
          raw: resolved.raw,
          unit: clamp01(metric.whenMissing ?? 0.5),
        };
      }
      return {
        label: metric.label,
        raw: resolved.raw,
        unit: lowerBetter(resolved.value, metric.halfAt),
      };
    }
    case "booleanMap": {
      const on = resolved.booleanValue === true;
      return {
        label: metric.label,
        raw: resolved.raw,
        unit: clamp01(on ? metric.whenTrue : metric.whenFalse),
      };
    }
    case "enumMap": {
      const key = resolved.enumKey ?? "none";
      return {
        label: metric.label,
        raw: resolved.raw,
        unit: clamp01(metric.values[key] ?? metric.values.none ?? 0),
      };
    }
    case "matchOne": {
      const key = resolved.enumKey ?? "";
      const matched = key === metric.matchKey;
      return {
        label: metric.label,
        raw: resolved.raw,
        unit: clamp01(matched ? metric.whenMatch : metric.whenNoMatch),
      };
    }
    default: {
      const _exhaustive: never = metric;
      return _exhaustive;
    }
  }
}

export function createRadarMetricId(axisId: RadarAxisId, source: RadarSourceId): string {
  return `${axisId}-${source}-${Math.random().toString(36).slice(2, 7)}`;
}

export function defaultMetricForSource(
  axisId: RadarAxisId,
  source: RadarSourceId,
  options?: {
    modifierId?: string;
    effectKind?: string;
    deliveryId?: string;
  }
): RadarMetric {
  const label =
    RADAR_SOURCE_OPTIONS.find((s) => s.id === source)?.label ?? source;
  const id = createRadarMetricId(axisId, source);
  const base = { id, axisId, label, enabled: true as const, source };

  if (source === "seeksTarget") {
    return { ...base, curve: "booleanMap", whenTrue: 1, whenFalse: 0 };
  }
  if (source === "effectKind") {
    const matchKey = options?.effectKind ?? "slow";
    return {
      ...base,
      label: `Effect · ${matchKey}`,
      curve: "matchOne",
      matchKey,
      whenMatch: matchKey === "slow" ? 0.75 : 1,
      whenNoMatch: 0,
    };
  }
  if (source === "deliveryId") {
    const matchKey = options?.deliveryId ?? "hurl";
    return {
      ...base,
      label: "Delivery match",
      curve: "matchOne",
      matchKey,
      whenMatch: 1,
      whenNoMatch: 0,
    };
  }
  if (source === "modifierStacks") {
    return {
      ...base,
      modifierId: options?.modifierId ?? "split",
      curve: "higherBetter",
      halfAt: 1,
      whenZero: 0,
    };
  }
  if (
    source === "manaCost" ||
    source === "manaPerSecond" ||
    source === "castTime"
  ) {
    return {
      ...base,
      curve: "lowerBetter",
      halfAt: source === "castTime" ? 1.5 : 30,
      ...(source === "manaPerSecond" ? { whenMissing: 0.5 } : {}),
    };
  }
  return { ...base, curve: "higherBetter", halfAt: 10, whenZero: 0 };
}

/** Unique status-effect kinds from nouns, plus none. */
export function collectEffectKindOptions(
  nouns: { statusEffect?: { kind: string } }[]
): { id: string; label: string }[] {
  const kinds = new Set<string>(["none"]);
  for (const noun of nouns) {
    if (noun.statusEffect?.kind) kinds.add(noun.statusEffect.kind);
  }
  return [...kinds].sort().map((id) => ({
    id,
    label: id === "none" ? "No effect" : id,
  }));
}

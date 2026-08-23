import type { GlobalConfig, SpellCombo } from "@/lib/types";

export type RadarAxisId =
  | "cost"
  | "time"
  | "impact"
  | "efficiency"
  | "deliveryControl"
  | "statusEffect";

export type RadarAxisResult = {
  id: RadarAxisId;
  label: string;
  shortLabel: string;
  /** Score on this axis, from 0 to maxWeight. */
  score: number;
  maxWeight: number;
  /** score / maxWeight, or 0 when max is 0. */
  normalized: number;
  metrics: { label: string; raw: string; contribution: number }[];
};

export type SpellRadarScore = {
  axes: RadarAxisResult[];
  /** Sum of axis scores. */
  totalScore: number;
  /** Sum of configured axis max weights. */
  maxTotalScore: number;
  /** totalScore / maxTotalScore, or 0 when max is 0. */
  normalizedTotal: number;
};

export const RADAR_AXIS_OPTIONS: {
  id: RadarAxisId;
  label: string;
  shortLabel: string;
}[] = [
  { id: "cost", label: "Affordability", shortLabel: "Afford." },
  { id: "time", label: "Speed", shortLabel: "Speed" },
  { id: "impact", label: "Impact", shortLabel: "Impact" },
  { id: "efficiency", label: "Efficiency", shortLabel: "Eff." },
  {
    id: "deliveryControl",
    label: "Control",
    shortLabel: "Control",
  },
  { id: "statusEffect", label: "Status Effect", shortLabel: "Status" },
];

const RADAR_AXIS_SORT_PREFIX = "radarAxis:";

export function radarAxisSortKey(axisId: RadarAxisId): string {
  return `${RADAR_AXIS_SORT_PREFIX}${axisId}`;
}

export function parseRadarAxisSortKey(sortKey: string): RadarAxisId | null {
  if (!sortKey.startsWith(RADAR_AXIS_SORT_PREFIX)) return null;
  const axisId = sortKey.slice(RADAR_AXIS_SORT_PREFIX.length) as RadarAxisId;
  return RADAR_AXIS_OPTIONS.some((a) => a.id === axisId) ? axisId : null;
}

/** Soft curve: value = k → 0.5. Higher values approach 1. */
function higherBetter(value: number, halfAt: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (halfAt <= 0) return 1;
  return value / (value + halfAt);
}

/** Soft curve: value = k → 0.5. Lower values approach 1. */
function lowerBetter(value: number, halfAt: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  if (halfAt <= 0) return 0;
  return halfAt / (value + halfAt);
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function axisScore(
  id: RadarAxisId,
  label: string,
  shortLabel: string,
  maxWeight: number,
  metrics: { label: string; raw: string; unit: number }[]
): RadarAxisResult {
  const contributions = metrics.map((m) => clamp01(m.unit));
  const blended = average(contributions);
  const score = Math.max(0, maxWeight) * blended;
  return {
    id,
    label,
    shortLabel,
    score,
    maxWeight: Math.max(0, maxWeight),
    normalized: maxWeight > 0 ? score / maxWeight : 0,
    metrics: metrics.map((m, i) => ({
      label: m.label,
      raw: m.raw,
      contribution: contributions[i],
    })),
  };
}

function modifierStackCount(combo: SpellCombo, modifierId: string): number {
  return combo.modifierCounts[modifierId] ?? 0;
}

/** Map effect kind to a categorical baseline for control utility. */
function effectCategoryScore(
  kind: SpellCombo["effect"]["kind"],
  config: GlobalConfig
): number {
  switch (kind) {
    case "slow":
      return clamp01(config.radarEffectScoreSlow);
    case "burn":
      return clamp01(config.radarEffectScoreBurn);
    default: {
      const _exhaustive: never = kind;
      return _exhaustive;
    }
  }
}

export function scoreSpellRadar(
  combo: SpellCombo,
  config: GlobalConfig
): SpellRadarScore {
  const splitStacks = modifierStackCount(combo, "split");

  const axes: RadarAxisResult[] = [
    axisScore(
      "cost",
      "Affordability",
      "Afford.",
      config.radarMaxCost,
      [
        {
          label: "Mana Cost",
          raw: combo.manaCost.toFixed(1),
          unit: lowerBetter(combo.manaCost, config.radarHalfManaCost),
        },
        {
          label: "Mana / Second",
          raw:
            combo.castTime > 0 ? combo.manaPerSecond.toFixed(2) : "—",
          unit:
            combo.castTime > 0
              ? lowerBetter(combo.manaPerSecond, config.radarHalfManaPerSecond)
              : 0.5,
        },
      ]
    ),
    axisScore(
      "time",
      "Speed",
      "Speed",
      config.radarMaxTime,
      [
        {
          label: "Cast Time",
          raw: combo.castTime.toFixed(2) + "s",
          unit: lowerBetter(combo.castTime, config.radarHalfCastTime),
        },
      ]
    ),
    axisScore(
      "impact",
      "Impact",
      "Impact",
      config.radarMaxImpact,
      [
        {
          label: "Total Damage",
          raw: combo.totalDamage.toFixed(2),
          unit: higherBetter(combo.totalDamage, config.radarHalfTotalDamage),
        },
        {
          label: "Damage / Instance",
          raw: combo.damagePerInstance.toFixed(2),
          unit: higherBetter(
            combo.damagePerInstance,
            config.radarHalfDamagePerInstance
          ),
        },
      ]
    ),
    axisScore(
      "efficiency",
      "Efficiency",
      "Eff.",
      config.radarMaxEfficiency,
      [
        {
          label: "Damage / Mana",
          raw:
            combo.manaCost > 0 ? combo.damagePerMana.toFixed(3) : "—",
          unit:
            combo.manaCost > 0
              ? higherBetter(combo.damagePerMana, config.radarHalfDamagePerMana)
              : 0,
        },
      ]
    ),
    axisScore(
      "deliveryControl",
      "Control",
      "Control",
      config.radarMaxDeliveryControl,
      [
        {
          label: "Seek",
          raw: combo.seeksTarget ? "yes" : "no",
          unit: combo.seeksTarget
            ? clamp01(config.radarSeekScoreYes)
            : clamp01(config.radarSeekScoreNo),
        },
        {
          label: "Targets",
          raw: String(combo.chainTargets),
          unit: higherBetter(combo.chainTargets, config.radarHalfChainTargets),
        },
        {
          label: "Split",
          raw: splitStacks > 0 ? `${splitStacks} stack${splitStacks > 1 ? "s" : ""}` : "none",
          unit:
            splitStacks > 0
              ? higherBetter(splitStacks, config.radarHalfSplitStacks)
              : 0,
        },
        {
          label: "Effect",
          raw: combo.effect.name,
          unit: effectCategoryScore(combo.effect.kind, config),
        },
      ]
    ),
    axisScore(
      "statusEffect",
      "Status Effect",
      "Status",
      config.radarMaxStatusEffect,
      [
        {
          label: "Duration",
          raw: combo.effect.duration.toFixed(1) + "s",
          unit: higherBetter(
            combo.effect.duration,
            config.radarHalfEffectDuration
          ),
        },
        {
          label: "Effect Potency",
          raw: combo.effect.potency.toFixed(2),
          unit: higherBetter(
            combo.effect.potency,
            config.radarHalfEffectPotency
          ),
        },
      ]
    ),
  ];

  const totalScore = axes.reduce((sum, a) => sum + a.score, 0);
  const maxTotalScore = axes.reduce((sum, a) => sum + a.maxWeight, 0);

  return {
    axes,
    totalScore,
    maxTotalScore,
    normalizedTotal: maxTotalScore > 0 ? totalScore / maxTotalScore : 0,
  };
}

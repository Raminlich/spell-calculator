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

function effectOutputRaw(c: SpellCombo): { value: number; display: string } {
  if (c.effect.kind === "burn") {
    const value = c.effect.damage ?? c.effect.potency;
    return { value, display: `${value.toFixed(2)} dmg` };
  }
  const value = c.effect.slowAmountPercent ?? c.effect.potency;
  return { value, display: `${value.toFixed(1)}%` };
}

/** Map delivery name to a stable 0–1 utility score for categorical Delivery. */
function deliveryCategoryScore(name: string): number {
  const key = name.trim().toLowerCase();
  if (!key) return 0.4;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return 0.35 + (hash % 66) / 100;
}

/** Map effect kind to a categorical baseline. */
function effectCategoryScore(kind: SpellCombo["effect"]["kind"]): number {
  switch (kind) {
    case "burn":
      return 0.75;
    case "slow":
      return 0.65;
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
  const effectOut = effectOutputRaw(combo);

  const axes: RadarAxisResult[] = [
    axisScore(
      "cost",
      "Cost",
      "Cost",
      config.radarMaxCost,
      [
        {
          label: "Mana Cost",
          raw: combo.manaCost.toFixed(1),
          unit: lowerBetter(combo.manaCost, 40),
        },
        {
          label: "Mana / Second",
          raw:
            combo.castTime > 0 ? combo.manaPerSecond.toFixed(2) : "—",
          unit:
            combo.castTime > 0
              ? lowerBetter(combo.manaPerSecond, 30)
              : 0.5,
        },
        {
          label: "Potency / Mana",
          raw:
            combo.manaCost > 0 ? combo.potencyPerMana.toFixed(3) : "—",
          unit:
            combo.manaCost > 0
              ? higherBetter(combo.potencyPerMana, 0.4)
              : 0,
        },
      ]
    ),
    axisScore(
      "time",
      "Time",
      "Time",
      config.radarMaxTime,
      [
        {
          label: "Cast Time",
          raw: combo.castTime.toFixed(2) + "s",
          unit: lowerBetter(combo.castTime, 1.5),
        },
        {
          label: "Potency / Second",
          raw:
            combo.castTime > 0
              ? combo.potencyPerSecond.toFixed(2)
              : "—",
          unit:
            combo.castTime > 0
              ? higherBetter(combo.potencyPerSecond, 15)
              : 0,
        },
        {
          label: "Mana / Second",
          raw:
            combo.castTime > 0 ? combo.manaPerSecond.toFixed(2) : "—",
          unit:
            combo.castTime > 0
              ? higherBetter(combo.manaPerSecond, 25)
              : 0.5,
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
          unit: higherBetter(combo.totalDamage, 40),
        },
        {
          label: "Damage / Instance",
          raw: combo.damagePerInstance.toFixed(2),
          unit: higherBetter(combo.damagePerInstance, 15),
        },
        {
          label: "Instances",
          raw: String(combo.instances),
          unit: higherBetter(combo.instances, 2),
        },
        {
          label: "Potency Pool",
          raw: combo.potencyPool.toFixed(1),
          unit: higherBetter(combo.potencyPool, 20),
        },
        {
          label: "Potency / Instance",
          raw: combo.potencyPerInstance.toFixed(2),
          unit: higherBetter(combo.potencyPerInstance, 12),
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
              ? higherBetter(combo.damagePerMana, 0.8)
              : 0,
        },
        {
          label: "Last Hop Potency",
          raw:
            combo.chainTargets > 1
              ? combo.lastHopPotency.toFixed(2)
              : "—",
          unit:
            combo.chainTargets > 1
              ? higherBetter(combo.lastHopPotency, 8)
              : higherBetter(combo.potencyPerInstance, 12),
        },
        {
          label: "Effect Potency",
          raw: combo.effect.potency.toFixed(2),
          unit: higherBetter(combo.effect.potency, 1.5),
        },
      ]
    ),
    axisScore(
      "deliveryControl",
      "Delivery & Control",
      "Control",
      config.radarMaxDeliveryControl,
      [
        {
          label: "Delivery",
          raw: combo.delivery.name,
          unit: deliveryCategoryScore(combo.delivery.name),
        },
        {
          label: "Seek",
          raw: combo.seeksTarget ? "yes" : "no",
          unit: combo.seeksTarget ? 1 : 0,
        },
        {
          label: "Targets",
          raw: String(combo.chainTargets),
          unit: higherBetter(combo.chainTargets, 2),
        },
        {
          label: "Effect",
          raw: combo.effect.name,
          unit: effectCategoryScore(combo.effect.kind),
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
          unit: higherBetter(combo.effect.duration, 5),
        },
        {
          label: "Burn Damage / Slow %",
          raw: effectOut.display,
          unit: higherBetter(
            effectOut.value,
            combo.effect.kind === "burn" ? 8 : 40
          ),
        },
        {
          label: "Effect Potency",
          raw: combo.effect.potency.toFixed(2),
          unit: higherBetter(combo.effect.potency, 1.5),
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

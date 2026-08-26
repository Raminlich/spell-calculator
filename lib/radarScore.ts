import type { GlobalConfig, SpellCombo } from "@/lib/types";
import {
  AXIS_MAX_WEIGHT_KEY,
  evaluateRadarMetric,
  RADAR_AXIS_OPTIONS,
  type RadarAxisId,
  type RadarMetric,
} from "@/lib/radarMetrics";

export type { RadarAxisId } from "@/lib/radarMetrics";
export { RADAR_AXIS_OPTIONS } from "@/lib/radarMetrics";

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

const RADAR_AXIS_SORT_PREFIX = "radarAxis:";

export function radarAxisSortKey(axisId: RadarAxisId): string {
  return `${RADAR_AXIS_SORT_PREFIX}${axisId}`;
}

export function parseRadarAxisSortKey(sortKey: string): RadarAxisId | null {
  if (!sortKey.startsWith(RADAR_AXIS_SORT_PREFIX)) return null;
  const axisId = sortKey.slice(RADAR_AXIS_SORT_PREFIX.length) as RadarAxisId;
  return RADAR_AXIS_OPTIONS.some((a) => a.id === axisId) ? axisId : null;
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

export function scoreSpellRadar(
  combo: SpellCombo,
  config: GlobalConfig,
  radarMetrics: RadarMetric[] = []
): SpellRadarScore {
  const metricsList = radarMetrics ?? [];
  const axes: RadarAxisResult[] = RADAR_AXIS_OPTIONS.map((axis) => {
    const metrics = metricsList
      .filter((m) => m.axisId === axis.id && m.enabled)
      .map((m) => evaluateRadarMetric(combo, m));
    return axisScore(
      axis.id,
      axis.label,
      axis.shortLabel,
      config[AXIS_MAX_WEIGHT_KEY[axis.id]],
      metrics
    );
  });

  const totalScore = axes.reduce((sum, a) => sum + a.score, 0);
  const maxTotalScore = axes.reduce((sum, a) => sum + a.maxWeight, 0);

  return {
    axes,
    totalScore,
    maxTotalScore,
    normalizedTotal: maxTotalScore > 0 ? totalScore / maxTotalScore : 0,
  };
}

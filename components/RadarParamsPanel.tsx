"use client";

import type { ReactNode } from "react";
import type { GlobalConfig } from "@/lib/types";
import { defaultGlobalConfig } from "@/lib/defaultData";

/** All Radar-page tunable keys (categorical + soft-curve midpoints). */
export const RADAR_PARAM_KEYS = [
  "radarEffectScoreSlow",
  "radarEffectScoreBurn",
  "radarSeekScoreYes",
  "radarSeekScoreNo",
  "radarHalfManaCost",
  "radarHalfManaPerSecond",
  "radarHalfCastTime",
  "radarHalfTotalDamage",
  "radarHalfDamagePerInstance",
  "radarHalfDamagePerMana",
  "radarHalfChainTargets",
  "radarHalfSplitStacks",
  "radarHalfEffectDuration",
  "radarHalfEffectPotency",
] as const;

type RadarParamKey = (typeof RADAR_PARAM_KEYS)[number];

function Field({
  label,
  hint,
  value,
  onChange,
  step,
  max,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink/70">{label}</span>
      <input
        type="number"
        step={step}
        min={0}
        max={max}
        value={value}
        onChange={(e) => {
          const next = parseFloat(e.target.value);
          onChange(Number.isFinite(next) ? next : 0);
        }}
        className="rounded border border-line bg-surface px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {hint && <span className="text-[11px] text-ink/45">{hint}</span>}
    </label>
  );
}

function AxisSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded border border-line bg-surface p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
        {title}
      </h2>
      <p className="mt-1 text-xs text-ink/50">{description}</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function defaultHint(key: RadarParamKey): string {
  return `Default ${defaultGlobalConfig[key]}`;
}

export default function RadarParamsPanel({
  config,
  onChange,
}: {
  config: GlobalConfig;
  onChange: (c: GlobalConfig) => void;
}) {
  function set(key: RadarParamKey, value: number) {
    onChange({ ...config, [key]: value });
  }

  function restoreDefaults() {
    const next = { ...config };
    for (const key of RADAR_PARAM_KEYS) {
      next[key] = defaultGlobalConfig[key];
    }
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink/50">
          Midpoints are the value that scores 0.5 on each soft curve. Categorical
          scores are fixed 0–1 contributions.
        </p>
        <button
          type="button"
          onClick={restoreDefaults}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
        >
          Restore to defaults
        </button>
      </div>

      <AxisSection
        title="Affordability"
        description="Lower is better. Midpoint → 0.5 on the curve."
      >
        <Field
          label="Mana Cost midpoint"
          hint={defaultHint("radarHalfManaCost")}
          value={config.radarHalfManaCost}
          step={1}
          onChange={(v) => set("radarHalfManaCost", v)}
        />
        <Field
          label="Mana / Second midpoint"
          hint={defaultHint("radarHalfManaPerSecond")}
          value={config.radarHalfManaPerSecond}
          step={1}
          onChange={(v) => set("radarHalfManaPerSecond", v)}
        />
      </AxisSection>

      <AxisSection
        title="Speed"
        description="Lower cast time is better. Midpoint → 0.5 on the curve."
      >
        <Field
          label="Cast Time midpoint (s)"
          hint={defaultHint("radarHalfCastTime")}
          value={config.radarHalfCastTime}
          step={0.1}
          onChange={(v) => set("radarHalfCastTime", v)}
        />
      </AxisSection>

      <AxisSection
        title="Impact"
        description="Higher is better. Midpoint → 0.5 on the curve."
      >
        <Field
          label="Total Damage midpoint"
          hint={defaultHint("radarHalfTotalDamage")}
          value={config.radarHalfTotalDamage}
          step={1}
          onChange={(v) => set("radarHalfTotalDamage", v)}
        />
        <Field
          label="Damage / Instance midpoint"
          hint={defaultHint("radarHalfDamagePerInstance")}
          value={config.radarHalfDamagePerInstance}
          step={1}
          onChange={(v) => set("radarHalfDamagePerInstance", v)}
        />
      </AxisSection>

      <AxisSection
        title="Efficiency"
        description="Higher is better. Midpoint → 0.5 on the curve."
      >
        <Field
          label="Damage / Mana midpoint"
          hint={defaultHint("radarHalfDamagePerMana")}
          value={config.radarHalfDamagePerMana}
          step={0.1}
          onChange={(v) => set("radarHalfDamagePerMana", v)}
        />
      </AxisSection>

      <AxisSection
        title="Control"
        description="Categorical scores (0–1) plus soft-curve midpoints for Targets and Split."
      >
        <Field
          label="Seek present"
          hint={defaultHint("radarSeekScoreYes")}
          value={config.radarSeekScoreYes}
          step={0.05}
          max={1}
          onChange={(v) => set("radarSeekScoreYes", v)}
        />
        <Field
          label="Seek absent"
          hint={defaultHint("radarSeekScoreNo")}
          value={config.radarSeekScoreNo}
          step={0.05}
          max={1}
          onChange={(v) => set("radarSeekScoreNo", v)}
        />
        <Field
          label="Effect · Slow"
          hint={defaultHint("radarEffectScoreSlow")}
          value={config.radarEffectScoreSlow}
          step={0.05}
          max={1}
          onChange={(v) => set("radarEffectScoreSlow", v)}
        />
        <Field
          label="Effect · Burn"
          hint={defaultHint("radarEffectScoreBurn")}
          value={config.radarEffectScoreBurn}
          step={0.05}
          max={1}
          onChange={(v) => set("radarEffectScoreBurn", v)}
        />
        <Field
          label="Targets midpoint"
          hint={defaultHint("radarHalfChainTargets")}
          value={config.radarHalfChainTargets}
          step={0.5}
          onChange={(v) => set("radarHalfChainTargets", v)}
        />
        <Field
          label="Split stacks midpoint"
          hint={defaultHint("radarHalfSplitStacks")}
          value={config.radarHalfSplitStacks}
          step={0.5}
          onChange={(v) => set("radarHalfSplitStacks", v)}
        />
      </AxisSection>

      <AxisSection
        title="Status Effect"
        description="Higher is better. Midpoint → 0.5 on the curve."
      >
        <Field
          label="Duration midpoint (s)"
          hint={defaultHint("radarHalfEffectDuration")}
          value={config.radarHalfEffectDuration}
          step={0.5}
          onChange={(v) => set("radarHalfEffectDuration", v)}
        />
        <Field
          label="Effect Potency midpoint"
          hint={defaultHint("radarHalfEffectPotency")}
          value={config.radarHalfEffectPotency}
          step={0.1}
          onChange={(v) => set("radarHalfEffectPotency", v)}
        />
      </AxisSection>
    </div>
  );
}

"use client";

import CardField from "@/components/CardField";
import CategorySection from "@/components/CategorySection";
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

type ParamDef = {
  key: RadarParamKey;
  label: string;
  step: number;
  max?: number;
  span?: boolean;
};

function AxisCard({
  title,
  badge,
  params,
  config,
  onChange,
}: {
  title: string;
  badge: string;
  params: ParamDef[];
  config: GlobalConfig;
  onChange: (key: RadarParamKey, value: number) => void;
}) {
  return (
    <article className="@container flex min-w-0 flex-col gap-2 rounded border border-line bg-white p-2.5">
      <header className="flex items-center gap-2 border-b border-line/70 pb-1">
        <h3 className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-balance">
          {title}
        </h3>
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink/40">
          {badge}
        </span>
      </header>
      <div className="grid grid-cols-1 gap-1.5 @min-[15rem]:grid-cols-2">
        {params.map((param) => (
          <CardField
            key={param.key}
            id={`radar-${param.key}`}
            label={param.label}
            type="number"
            step={param.step}
            min={0}
            max={param.max}
            hint={`Default ${defaultGlobalConfig[param.key]}`}
            value={config[param.key]}
            onChange={(v) => {
              const next = parseFloat(v);
              onChange(param.key, Number.isFinite(next) ? next : 0);
            }}
            className={param.span ? "@min-[15rem]:col-span-2" : undefined}
          />
        ))}
      </div>
    </article>
  );
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
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-xs text-ink/50 text-pretty">
          Midpoints are the value that scores 0.5 on each soft curve. Categorical
          scores are fixed 0–1 contributions. Hover a label for its default.
        </p>
        <button
          type="button"
          onClick={restoreDefaults}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
        >
          Restore to defaults
        </button>
      </div>

      <CategorySection
        title="Soft curves"
        description="Lower-is-better and higher-is-better midpoints for the main radar axes."
      >
        <AxisCard
          title="Affordability"
          badge="Lower better"
          config={config}
          onChange={set}
          params={[
            { key: "radarHalfManaCost", label: "Mana cost midpoint", step: 1 },
            {
              key: "radarHalfManaPerSecond",
              label: "Mana / second midpoint",
              step: 1,
            },
          ]}
        />
        <AxisCard
          title="Speed"
          badge="Lower better"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarHalfCastTime",
              label: "Cast time midpoint (s)",
              step: 0.1,
              span: true,
            },
          ]}
        />
        <AxisCard
          title="Impact"
          badge="Higher better"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarHalfTotalDamage",
              label: "Total damage midpoint",
              step: 1,
            },
            {
              key: "radarHalfDamagePerInstance",
              label: "Damage / instance midpoint",
              step: 1,
            },
          ]}
        />
        <AxisCard
          title="Efficiency"
          badge="Higher better"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarHalfDamagePerMana",
              label: "Damage / mana midpoint",
              step: 0.1,
              span: true,
            },
          ]}
        />
        <AxisCard
          title="Status effect"
          badge="Higher better"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarHalfEffectDuration",
              label: "Duration midpoint (s)",
              step: 0.5,
            },
            {
              key: "radarHalfEffectPotency",
              label: "Effect potency midpoint",
              step: 0.1,
            },
          ]}
        />
      </CategorySection>

      <CategorySection
        title="Control"
        description="Categorical 0–1 scores plus midpoints for targets and Split stacks."
      >
        <AxisCard
          title="Seek"
          badge="Categorical"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarSeekScoreYes",
              label: "Seek present",
              step: 0.05,
              max: 1,
            },
            {
              key: "radarSeekScoreNo",
              label: "Seek absent",
              step: 0.05,
              max: 1,
            },
          ]}
        />
        <AxisCard
          title="Effect kind"
          badge="Categorical"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarEffectScoreSlow",
              label: "Effect · Slow",
              step: 0.05,
              max: 1,
            },
            {
              key: "radarEffectScoreBurn",
              label: "Effect · Burn",
              step: 0.05,
              max: 1,
            },
          ]}
        />
        <AxisCard
          title="Targets & Split"
          badge="Higher better"
          config={config}
          onChange={set}
          params={[
            {
              key: "radarHalfChainTargets",
              label: "Targets midpoint",
              step: 0.5,
            },
            {
              key: "radarHalfSplitStacks",
              label: "Split stacks midpoint",
              step: 0.5,
            },
          ]}
        />
      </CategorySection>
    </div>
  );
}

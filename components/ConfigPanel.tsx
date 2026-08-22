"use client";

import { GlobalConfig } from "@/lib/types";

function Field({
  label,
  hint,
  value,
  onChange,
  step = 0.1,
  min = 0,
  max,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink/70">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="rounded border border-line bg-white px-2 py-1 text-sm focus:border-accent focus:outline-none"
      />
      {hint && <span className="text-[11px] text-ink/45">{hint}</span>}
    </label>
  );
}

export default function ConfigPanel({
  config,
  onChange,
}: {
  config: GlobalConfig;
  onChange: (c: GlobalConfig) => void;
}) {
  function set<K extends keyof GlobalConfig>(key: K, value: GlobalConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <Field
        label="Mana multiplier"
        hint="Global scalar on total mana cost"
        value={config.manaMultiplier}
        onChange={(v) => set("manaMultiplier", v)}
      />
      <Field
        label="Cast time multiplier"
        hint="Global scalar on total cast time"
        value={config.castTimeMultiplier}
        onChange={(v) => set("castTimeMultiplier", v)}
      />
      <Field
        label="Mana growth base"
        hint="Per-stack exponent for repeated modifiers"
        value={config.manaExponent}
        onChange={(v) => set("manaExponent", v)}
      />
      <Field
        label="Time growth base"
        hint="Per-stack exponent for repeated modifiers"
        value={config.timeExponent}
        onChange={(v) => set("timeExponent", v)}
      />
      <Field
        label="Max repeats / modifier"
        hint="Cap on stacking one modifier type"
        value={config.maxRepeatPerModifier}
        step={1}
        min={0}
        onChange={(v) => set("maxRepeatPerModifier", Math.round(v))}
      />
      <Field
        label="Max modifiers / spell"
        hint="Cap on total modifier count"
        value={config.maxTotalModifiers}
        step={1}
        min={0}
        onChange={(v) => set("maxTotalModifiers", Math.round(v))}
      />
      <Field
        label="Min modifiers / spell"
        hint="Floor on total modifier count"
        value={config.minTotalModifiers}
        step={1}
        min={0}
        onChange={(v) => set("minTotalModifiers", Math.round(v))}
      />
    </div>
  );
}

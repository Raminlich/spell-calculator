"use client";

import type { GlobalConfig, SpellCombo } from "@/lib/types";
import type { RadarMetric } from "@/lib/radarMetrics";
import { scoreSpellRadar } from "@/lib/radarScore";
import SpellRadarChart from "@/components/SpellRadarChart";

function effectOutput(combo: SpellCombo): string {
  if (!combo.effect) return "—";
  if (combo.effect.kind === "burn") {
    return `${(combo.effect.damage ?? combo.effect.potency).toFixed(2)} burn dmg`;
  }
  return `${(combo.effect.slowAmountPercent ?? combo.effect.potency).toFixed(1)}% slow`;
}

export default function SpellBuilderResults({
  combo,
  config,
  radarMetrics,
}: {
  combo: SpellCombo;
  config: GlobalConfig;
  radarMetrics: RadarMetric[];
}) {
  const radar = scoreSpellRadar(combo, config, radarMetrics);

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
        Results
      </h2>

      <p className="mb-1 text-xs text-ink/50">{combo.label}</p>

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded border border-line/80 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">
            Spell potency
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {combo.potencyPool.toFixed(2)}
          </p>
        </div>
        <div className="rounded border border-line/80 px-3 py-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-ink/45">
            Effect potency
          </p>
          <p className="mt-1 font-mono text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {combo.effect ? combo.effect.potency.toFixed(2) : "—"}
          </p>
        </div>
      </div>

      <div className="mb-2 flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium text-ink/60">Radar</p>
        <p className="font-mono text-xs text-ink/50">
          {radar.totalScore.toFixed(1)} / {radar.maxTotalScore.toFixed(0)}
          <span className="ml-1 text-ink/40">
            ({(radar.normalizedTotal * 100).toFixed(0)}%)
          </span>
        </p>
      </div>
      <SpellRadarChart axes={radar.axes} />

      <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Mana cost" value={combo.manaCost.toFixed(1)} />
        <Stat label="Cast time" value={`${combo.castTime.toFixed(2)}s`} />
        <Stat label="Total damage" value={combo.totalDamage.toFixed(2)} />
        <Stat label="Instances" value={String(combo.instances)} />
        <Stat label="Effect" value={combo.effect?.name ?? "—"} />
        <Stat
          label="Effect duration"
          value={
            combo.effect ? `${combo.effect.duration.toFixed(1)}s` : "—"
          }
        />
        <Stat label="Effect output" value={effectOutput(combo)} />
        <Stat
          label="Damage / instance"
          value={combo.damagePerInstance.toFixed(2)}
        />
        <Stat
          label="Targets"
          value={
            combo.seeksTarget
              ? `${combo.chainTargets} (seek)`
              : String(combo.chainTargets)
          }
        />
      </ul>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded border border-line/80 px-2.5 py-2">
      <p className="text-[11px] text-ink/45">{label}</p>
      <p className="mt-0.5 font-mono text-sm text-ink/80">{value}</p>
    </li>
  );
}

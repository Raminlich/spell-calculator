"use client";

import { useSpellConfig } from "@/components/SpellConfigContext";
import SaveControls from "@/components/SaveControls";
import RadarParamsPanel from "@/components/RadarParamsPanel";
import { defaultRadarMetrics } from "@/lib/radarMetrics";

export default function RadarPage() {
  const {
    radarMetrics,
    updateRadarMetric,
    addRadarMetric,
    removeRadarMetric,
    setRadarMetrics,
    nouns,
    deliveryVerbs,
    modifierVerbs,
  } = useSpellConfig();

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Radar scores</h1>
          <p className="mt-1 text-sm text-ink/55">
            Edit metrics on each fixed axis. Axis max weights stay on the
            Calculator page.
          </p>
        </div>
        <SaveControls contextLabel="Radar" />
      </div>

      <RadarParamsPanel
        radarMetrics={radarMetrics}
        onChange={(metric) => updateRadarMetric(metric.id, metric)}
        onAdd={addRadarMetric}
        onRemove={removeRadarMetric}
        onRestoreDefaults={() => setRadarMetrics(defaultRadarMetrics)}
        nouns={nouns}
        deliveryVerbs={deliveryVerbs}
        modifierVerbs={modifierVerbs}
      />
    </main>
  );
}

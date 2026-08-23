"use client";

import { useSpellConfig } from "@/components/SpellConfigContext";
import SaveControls from "@/components/SaveControls";
import RadarParamsPanel from "@/components/RadarParamsPanel";

export default function RadarPage() {
  const { config, setConfig } = useSpellConfig();

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Radar scores</h1>
          <p className="mt-1 text-sm text-ink/55">
            Tune soft-curve midpoints and categorical scores for every radar axis.
            Axis max weights stay on the Calculator page.
          </p>
        </div>
        <SaveControls contextLabel="Radar" />
      </div>

      <RadarParamsPanel config={config} onChange={setConfig} />
    </main>
  );
}

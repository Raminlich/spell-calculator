"use client";

import { useMemo } from "react";
import { useSpellConfig } from "@/components/SpellConfigContext";
import { generateAllCombos } from "@/lib/spellEngine";
import ConfigPanel from "@/components/ConfigPanel";
import SpellTable from "@/components/SpellTable";
import SaveControls from "@/components/SaveControls";

export default function Home() {
  const { nouns, deliveryVerbs, modifierVerbs, config, setConfig } =
    useSpellConfig();

  const { combos, truncated } = useMemo(
    () => generateAllCombos(nouns, deliveryVerbs, modifierVerbs, config),
    [nouns, deliveryVerbs, modifierVerbs, config]
  );

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Calculator</h1>
          <p className="mt-1 text-sm text-ink/55">
            Global balance knobs and every generated spell combo. Edit magic
            components on the Components page.
          </p>
        </div>
        <SaveControls contextLabel="Calculator" />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Global config
        </h2>
        <div className="rounded border border-line bg-white p-4">
          <ConfigPanel config={config} onChange={setConfig} />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Generated combos
          </h2>
          <span className="text-xs text-ink/50">
            {combos.length.toLocaleString()} combinations
            {truncated ? " (capped — narrow your limits for the full set)" : ""}
          </span>
        </div>
        <SpellTable
          combos={combos}
          nounOptions={nouns.map((n) => ({ id: n.id, name: n.name }))}
          deliveryOptions={deliveryVerbs.map((d) => ({ id: d.id, name: d.name }))}
        />
      </section>
    </main>
  );
}

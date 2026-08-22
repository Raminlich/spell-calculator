"use client";

import { useMemo, useState } from "react";
import {
  defaultNouns,
  defaultDeliveryVerbs,
  defaultModifierVerbs,
  defaultGlobalConfig,
} from "@/lib/defaultData";
import { Noun, DeliveryVerb, ModifierVerb, GlobalConfig } from "@/lib/types";
import { generateAllCombos } from "@/lib/spellEngine";
import EditableTable, { EditableColumn } from "@/components/EditableTable";
import ConfigPanel from "@/components/ConfigPanel";
import SpellTable from "@/components/SpellTable";

const nounColumns: EditableColumn<Noun>[] = [
  { key: "name", label: "Name", type: "text", get: (r) => r.name, set: (r, v) => ({ ...r, name: v }) },
  {
    key: "description",
    label: "Description",
    type: "text",
    width: "40%",
    get: (r) => r.description,
    set: (r, v) => ({ ...r, description: v }),
  },
  {
    key: "manaCost",
    label: "Mana cost",
    type: "number",
    get: (r) => r.manaCost,
    set: (r, v) => ({ ...r, manaCost: parseFloat(v) || 0 }),
  },
  {
    key: "castTime",
    label: "Cast time",
    type: "number",
    get: (r) => r.castTime,
    set: (r, v) => ({ ...r, castTime: parseFloat(v) || 0 }),
  },
  {
    key: "potency",
    label: "Potency",
    type: "number",
    get: (r) => r.potency,
    set: (r, v) => ({ ...r, potency: parseFloat(v) || 0 }),
  },
];

const deliveryColumns: EditableColumn<DeliveryVerb>[] = [
  { key: "name", label: "Name", type: "text", get: (r) => r.name, set: (r, v) => ({ ...r, name: v }) },
  {
    key: "description",
    label: "Description",
    type: "text",
    width: "40%",
    get: (r) => r.description,
    set: (r, v) => ({ ...r, description: v }),
  },
  {
    key: "manaCost",
    label: "Mana cost",
    type: "number",
    get: (r) => r.manaCost,
    set: (r, v) => ({ ...r, manaCost: parseFloat(v) || 0 }),
  },
  {
    key: "castTime",
    label: "Cast time",
    type: "number",
    get: (r) => r.castTime,
    set: (r, v) => ({ ...r, castTime: parseFloat(v) || 0 }),
  },
  {
    key: "baseInstances",
    label: "Base instances",
    type: "number",
    step: 1,
    get: (r) => r.baseInstances,
    set: (r, v) => ({ ...r, baseInstances: parseFloat(v) || 0 }),
  },
];

const modifierColumns: EditableColumn<ModifierVerb>[] = [
  { key: "name", label: "Name", type: "text", get: (r) => r.name, set: (r, v) => ({ ...r, name: v }) },
  {
    key: "description",
    label: "Description",
    type: "text",
    width: "34%",
    get: (r) => r.description,
    set: (r, v) => ({ ...r, description: v }),
  },
  {
    key: "manaCost",
    label: "Mana cost",
    type: "number",
    get: (r) => r.manaCost,
    set: (r, v) => ({ ...r, manaCost: parseFloat(v) || 0 }),
  },
  {
    key: "castTime",
    label: "Cast time",
    type: "number",
    get: (r) => r.castTime,
    set: (r, v) => ({ ...r, castTime: parseFloat(v) || 0 }),
  },
  {
    key: "potencyMultiplier",
    label: "Potency x/stack",
    type: "number",
    get: (r) => r.potencyMultiplier,
    set: (r, v) => ({ ...r, potencyMultiplier: parseFloat(v) || 0 }),
  },
  {
    key: "instanceMultiplier",
    label: "Instances x/stack",
    type: "number",
    get: (r) => r.instanceMultiplier,
    set: (r, v) => ({ ...r, instanceMultiplier: parseFloat(v) || 0 }),
  },
];

export default function Home() {
  const [nouns, setNouns] = useState<Noun[]>(defaultNouns);
  const [deliveryVerbs, setDeliveryVerbs] = useState<DeliveryVerb[]>(defaultDeliveryVerbs);
  const [modifierVerbs, setModifierVerbs] = useState<ModifierVerb[]>(defaultModifierVerbs);
  const [config, setConfig] = useState<GlobalConfig>(defaultGlobalConfig);

  const { combos, truncated } = useMemo(
    () => generateAllCombos(nouns, deliveryVerbs, modifierVerbs, config),
    [nouns, deliveryVerbs, modifierVerbs, config]
  );

  function resetAll() {
    setNouns(defaultNouns);
    setDeliveryVerbs(defaultDeliveryVerbs);
    setModifierVerbs(defaultModifierVerbs);
    setConfig(defaultGlobalConfig);
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <header className="mb-8 flex items-baseline justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Spell Calculator</h1>
          <p className="mt-1 text-sm text-ink/55">
            Noun + verb spell crafting — combo generator &amp; cost balancing
          </p>
        </div>
        <button
          onClick={resetAll}
          className="rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
        >
          Reset to defaults
        </button>
      </header>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Global config
        </h2>
        <div className="rounded border border-line bg-white p-4">
          <ConfigPanel config={config} onChange={setConfig} />
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded border border-line bg-white p-4">
          <EditableTable rows={nouns} columns={nounColumns} onChange={setNouns} caption="Nouns" />
        </div>
        <div className="rounded border border-line bg-white p-4">
          <EditableTable
            rows={deliveryVerbs}
            columns={deliveryColumns}
            onChange={setDeliveryVerbs}
            caption="Delivery verbs"
          />
        </div>
        <div className="rounded border border-line bg-white p-4 lg:col-span-2">
          <EditableTable
            rows={modifierVerbs}
            columns={modifierColumns}
            onChange={setModifierVerbs}
            caption="Modifier verbs"
          />
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Generated combos
          </h2>
          <span className="text-xs text-ink/50">
            {combos.length.toLocaleString()} combinations
            {truncated ? " (capped — narrow your limits for the full set)" : ""}
          </span>
        </div>
        <SpellTable combos={combos} />
      </section>
    </main>
  );
}

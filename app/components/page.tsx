"use client";

import { useSpellConfig } from "@/components/SpellConfigContext";
import { ComponentPanel } from "@/components/compactFields";
import NounCard from "@/components/NounCard";
import DeliveryCard from "@/components/DeliveryCard";
import ModifierCard from "@/components/ModifierCard";
import SaveControls from "@/components/SaveControls";

export default function ComponentsPage() {
  const {
    nouns,
    updateNoun,
    deliveryVerbs,
    updateDelivery,
    modifierVerbs,
    updateModifier,
  } = useSpellConfig();

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">
            Magic components
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Edit stats inline; use <span className="font-medium">More</span> for
            descriptions and status effects. Hover a row to see its id.
          </p>
        </div>
        <SaveControls contextLabel="Components" />
      </div>

      <div className="flex flex-col gap-4">
        <ComponentPanel
          title="Nouns"
          description="Elemental bases with direct damage; some also carry a status effect."
          count={nouns.length}
          countLabel="noun"
        >
          {nouns.map((noun) => (
            <NounCard
              key={noun.id}
              noun={noun}
              onChange={(next) => updateNoun(noun.id, next)}
            />
          ))}
        </ComponentPanel>

        <ComponentPanel
          title="Delivery verbs"
          description="How the spell is launched and how many instances it creates."
          count={deliveryVerbs.length}
          countLabel="delivery"
        >
          {deliveryVerbs.map((verb) => (
            <DeliveryCard
              key={verb.id}
              verb={verb}
              onChange={(next) => updateDelivery(verb.id, next)}
            />
          ))}
        </ComponentPanel>

        <ComponentPanel
          title="Modifier verbs"
          description="Optional stacks that change cost, potency, or instance count."
          count={modifierVerbs.length}
          countLabel="modifier"
        >
          {modifierVerbs.map((verb) => (
            <ModifierCard
              key={verb.id}
              verb={verb}
              onChange={(next) => updateModifier(verb.id, next)}
            />
          ))}
        </ComponentPanel>
      </div>
    </main>
  );
}

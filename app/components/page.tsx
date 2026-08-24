"use client";

import { useSpellConfig } from "@/components/SpellConfigContext";
import CategorySection from "@/components/CategorySection";
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
          <h1 className="text-lg font-semibold tracking-tight">Magic components</h1>
          <p className="mt-1 text-sm text-ink/55">
            Configure each noun, delivery verb, and modifier verb as its own card.
            Changes apply to the calculator.
          </p>
        </div>
        <SaveControls contextLabel="Components" />
      </div>

      <CategorySection
        title="Nouns"
        description="Elemental bases with direct damage and a status effect."
      >
        {nouns.map((noun) => (
          <NounCard
            key={noun.id}
            noun={noun}
            onChange={(next) => updateNoun(noun.id, next)}
          />
        ))}
      </CategorySection>

      <CategorySection
        title="Delivery verbs"
        description="How the spell is launched and how many instances it creates."
      >
        {deliveryVerbs.map((verb) => (
          <DeliveryCard
            key={verb.id}
            verb={verb}
            onChange={(next) => updateDelivery(verb.id, next)}
          />
        ))}
      </CategorySection>

      <CategorySection
        title="Modifier verbs"
        description="Optional stacks that change cost, potency, or instance count."
      >
        {modifierVerbs.map((verb) => (
          <ModifierCard
            key={verb.id}
            verb={verb}
            onChange={(next) => updateModifier(verb.id, next)}
          />
        ))}
      </CategorySection>
    </main>
  );
}

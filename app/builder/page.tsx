"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSpellConfig } from "@/components/SpellConfigContext";
import SpellBuilderCompose from "@/components/SpellBuilderCompose";
import SpellBuilderResults from "@/components/SpellBuilderResults";
import { computeSpellCombo } from "@/lib/spellEngine";
import {
  defaultModifierCounts,
  decrementModifier,
  incrementModifier,
} from "@/lib/spellBuilderSelection";
import type { ModifierCount } from "@/lib/types";

export default function BuilderPage() {
  const { nouns, deliveryVerbs, modifierVerbs, config } = useSpellConfig();

  const [nounId, setNounId] = useState(() => nouns[0]?.id ?? "");
  const [deliveryId, setDeliveryId] = useState(
    () => deliveryVerbs[0]?.id ?? ""
  );
  const [modifierCounts, setModifierCounts] = useState<ModifierCount>(() =>
    defaultModifierCounts(modifierVerbs, config)
  );

  const modifiersById = useMemo(
    () => new Map(modifierVerbs.map((m) => [m.id, m])),
    [modifierVerbs]
  );

  const noun = nouns.find((n) => n.id === nounId) ?? nouns[0] ?? null;
  const delivery =
    deliveryVerbs.find((d) => d.id === deliveryId) ??
    deliveryVerbs[0] ??
    null;

  const combo = useMemo(() => {
    if (!noun || !delivery) return null;
    return computeSpellCombo(
      noun,
      delivery,
      modifierCounts,
      modifiersById,
      config
    );
  }, [noun, delivery, modifierCounts, modifiersById, config]);

  if (nouns.length === 0 || deliveryVerbs.length === 0) {
    return (
      <main className="mx-auto max-w-[1400px] px-6 py-8">
        <h1 className="text-lg font-semibold tracking-tight">Builder</h1>
        <p className="mt-3 text-sm text-ink/60">
          Add at least one noun and one delivery on the{" "}
          <Link href="/components" className="underline hover:text-ink">
            Components
          </Link>{" "}
          page to build a spell.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] px-6 py-8">
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-tight">Builder</h1>
        <p className="mt-1 text-sm text-ink/55">
          Select components; radar and potencies update live.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <SpellBuilderCompose
          nouns={nouns}
          deliveries={deliveryVerbs}
          modifiers={modifierVerbs}
          nounId={noun?.id ?? ""}
          deliveryId={delivery?.id ?? ""}
          modifierCounts={modifierCounts}
          config={config}
          onNounChange={setNounId}
          onDeliveryChange={setDeliveryId}
          onIncrementModifier={(id) =>
            setModifierCounts((prev) =>
              incrementModifier(id, prev, modifiersById, config)
            )
          }
          onDecrementModifier={(id) =>
            setModifierCounts((prev) => decrementModifier(id, prev))
          }
        />

        {combo ? (
          <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <SpellBuilderResults combo={combo} config={config} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

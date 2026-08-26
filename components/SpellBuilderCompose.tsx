"use client";

import type {
  DeliveryVerb,
  GlobalConfig,
  ModifierCount,
  ModifierVerb,
  Noun,
} from "@/lib/types";
import {
  canDecrementModifier,
  canIncrementModifier,
} from "@/lib/spellBuilderSelection";

export default function SpellBuilderCompose({
  nouns,
  deliveries,
  modifiers,
  nounId,
  deliveryId,
  modifierCounts,
  config,
  onNounChange,
  onDeliveryChange,
  onIncrementModifier,
  onDecrementModifier,
}: {
  nouns: Noun[];
  deliveries: DeliveryVerb[];
  modifiers: ModifierVerb[];
  nounId: string;
  deliveryId: string;
  modifierCounts: ModifierCount;
  config: GlobalConfig;
  onNounChange: (id: string) => void;
  onDeliveryChange: (id: string) => void;
  onIncrementModifier: (id: string) => void;
  onDecrementModifier: (id: string) => void;
}) {
  const modifiersById = new Map(modifiers.map((m) => [m.id, m]));

  return (
    <section className="rounded border border-line bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
        Compose
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/70">Noun</span>
          <select
            value={nounId}
            onChange={(e) => onNounChange(e.target.value)}
            className="rounded border border-line bg-white px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
          >
            {nouns.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink/70">Delivery</span>
          <select
            value={deliveryId}
            onChange={(e) => onDeliveryChange(e.target.value)}
            className="rounded border border-line bg-white px-2 py-1.5 text-sm focus:border-accent focus:outline-none"
          >
            {deliveries.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-medium text-ink/70">Modifiers</p>
        {modifiers.length === 0 ? (
          <p className="text-sm text-ink/50">No modifiers configured.</p>
        ) : (
          <ul className="space-y-2">
            {modifiers.map((mod) => {
              const count = modifierCounts[mod.id] ?? 0;
              const canUp = canIncrementModifier(
                mod.id,
                modifierCounts,
                modifiersById,
                config
              );
              const canDown = canDecrementModifier(mod.id, modifierCounts);
              return (
                <li
                  key={mod.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-line/80 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{mod.name}</p>
                    {mod.description ? (
                      <p className="mt-0.5 text-[11px] text-ink/45 line-clamp-1">
                        {mod.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Remove one ${mod.name}`}
                      disabled={!canDown}
                      onClick={() => onDecrementModifier(mod.id)}
                      className="h-8 w-8 rounded border border-line text-sm font-medium text-ink/70 enabled:hover:border-ink/30 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-sm tabular-nums">
                      {count}
                    </span>
                    <button
                      type="button"
                      aria-label={`Add one ${mod.name}`}
                      disabled={!canUp}
                      onClick={() => onIncrementModifier(mod.id)}
                      className="h-8 w-8 rounded border border-line text-sm font-medium text-ink/70 enabled:hover:border-ink/30 enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

"use client";

import CardField from "@/components/CardField";
import type { Noun } from "@/lib/types";

function parseNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function NounCard({
  noun,
  onChange,
}: {
  noun: Noun;
  onChange: (noun: Noun) => void;
}) {
  const prefix = `noun-${noun.id}`;
  const status = noun.statusEffect;

  return (
    <article className="@container flex flex-col gap-4 rounded border border-line bg-white p-4">
      <header>
        <h3 className="text-base font-semibold tracking-tight">{noun.name || "Noun"}</h3>
        <p className="mt-1 text-xs text-ink/45">Noun</p>
      </header>

      <div className="grid grid-cols-1 gap-3 @min-[20rem]:grid-cols-2">
        <CardField
          id={`${prefix}-name`}
          label="Name"
          value={noun.name}
          onChange={(v) => onChange({ ...noun, name: v })}
          className="@min-[20rem]:col-span-2"
        />
        <CardField
          id={`${prefix}-description`}
          label="Description"
          value={noun.description}
          onChange={(v) => onChange({ ...noun, description: v })}
          className="@min-[20rem]:col-span-2"
        />
        <CardField
          id={`${prefix}-potency`}
          label="Potency"
          type="number"
          value={noun.potency}
          onChange={(v) => onChange({ ...noun, potency: parseNum(v) })}
        />
        <CardField
          id={`${prefix}-damage`}
          label="Damage"
          type="number"
          value={noun.damage}
          onChange={(v) => onChange({ ...noun, damage: parseNum(v) })}
        />
        <CardField
          id={`${prefix}-castTime`}
          label="Casting time"
          type="number"
          value={noun.castTime}
          onChange={(v) => onChange({ ...noun, castTime: parseNum(v) })}
        />
        <CardField
          id={`${prefix}-manaCost`}
          label="Mana cost"
          type="number"
          value={noun.manaCost}
          onChange={(v) => onChange({ ...noun, manaCost: parseNum(v) })}
        />
        <CardField
          id={`${prefix}-bleed`}
          label="Potency bleed %"
          type="number"
          hint="Of potency gained above base: this % → effect, rest → damage"
          value={noun.potencyBleedPercent}
          onChange={(v) => onChange({ ...noun, potencyBleedPercent: parseNum(v) })}
          className="@min-[20rem]:col-span-2"
        />
      </div>

      <fieldset className="rounded border border-line/80 p-3">
        <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-ink/55">
          Status effect
        </legend>
        <div className="mt-2 grid grid-cols-1 gap-3 @min-[20rem]:grid-cols-2">
          <CardField
            id={`${prefix}-status-name`}
            label="Name"
            value={status.name}
            onChange={(v) =>
              onChange({
                ...noun,
                statusEffect: { ...status, name: v },
              })
            }
            className="@min-[20rem]:col-span-2"
          />
          <CardField
            id={`${prefix}-status-potency`}
            label="Base effect potency"
            type="number"
            hint="Strength rating for the base effect (usually 1)"
            value={status.potency}
            onChange={(v) =>
              onChange({
                ...noun,
                statusEffect: { ...status, potency: parseNum(v) },
              })
            }
          />
          <CardField
            id={`${prefix}-status-duration`}
            label="Duration"
            type="number"
            value={status.duration}
            onChange={(v) =>
              onChange({
                ...noun,
                statusEffect: { ...status, duration: parseNum(v) },
              })
            }
          />
          {status.kind === "burn" ? (
            <CardField
              id={`${prefix}-status-damage`}
              label="Burn damage @ base"
              type="number"
              hint="Damage when effect potency equals base"
              value={status.damage}
              onChange={(v) =>
                onChange({
                  ...noun,
                  statusEffect: { ...status, damage: parseNum(v) },
                })
              }
              className="@min-[20rem]:col-span-2"
            />
          ) : (
            <CardField
              id={`${prefix}-status-slow`}
              label="Slow % @ base"
              type="number"
              hint="Slow amount when effect potency equals base (e.g. 50 at potency 1)"
              value={status.slowAmountPercent}
              onChange={(v) =>
                onChange({
                  ...noun,
                  statusEffect: {
                    ...status,
                    slowAmountPercent: parseNum(v),
                  },
                })
              }
              className="@min-[20rem]:col-span-2"
            />
          )}
        </div>
      </fieldset>
    </article>
  );
}

"use client";

import CardEnableToggle from "@/components/CardEnableToggle";
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
    <article
      className={`@container flex min-w-0 flex-col gap-2 rounded border border-line bg-white p-2.5 ${
        noun.enabled ? "" : "opacity-55"
      }`}
    >
      <header className="flex items-center gap-2">
        <CardEnableToggle
          id={`${prefix}-enabled`}
          checked={noun.enabled}
          onChange={(enabled) => onChange({ ...noun, enabled })}
        />
        <CardField
          id={`${prefix}-name`}
          label="Name"
          value={noun.name}
          onChange={(v) => onChange({ ...noun, name: v })}
          variant="title"
          className="min-w-0 flex-1"
        />
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink/40">
          Noun
        </span>
      </header>

      <div className="grid grid-cols-1 gap-1.5 @min-[15rem]:grid-cols-2">
        <CardField
          id={`${prefix}-description`}
          label="Description"
          value={noun.description}
          onChange={(v) => onChange({ ...noun, description: v })}
          className="@min-[15rem]:col-span-2"
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
        {status && (
          <CardField
            id={`${prefix}-bleed`}
            label="Potency bleed %"
            type="number"
            hint="Of potency gained above base: this % → effect, rest → damage"
            value={noun.potencyBleedPercent}
            onChange={(v) => onChange({ ...noun, potencyBleedPercent: parseNum(v) })}
            className="@min-[15rem]:col-span-2"
          />
        )}
      </div>

      {status ? (
      <details className="group border-t border-line/70 pt-1.5">
        <summary className="flex cursor-pointer list-none items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50 marker:content-none [&::-webkit-details-marker]:hidden">
          <span
            aria-hidden
            className="inline-block text-[9px] text-ink/40 transition-transform group-open:rotate-90"
          >
            ▸
          </span>
          <span>Status effect</span>
          <span className="normal-case tracking-normal text-ink/40 group-open:hidden">
            · {status.name || "—"}
          </span>
        </summary>
        <div className="mt-1.5 grid grid-cols-1 gap-1.5 @min-[15rem]:grid-cols-2">
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
            className="@min-[15rem]:col-span-2"
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
              className="@min-[15rem]:col-span-2"
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
              className="@min-[15rem]:col-span-2"
            />
          )}
        </div>
      </details>
      ) : (
        <p className="border-t border-line/70 pt-1.5 text-[10px] text-ink/40">
          No status effect
        </p>
      )}
    </article>
  );
}

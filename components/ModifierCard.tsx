"use client";

import CardField from "@/components/CardField";
import type { ModifierVerb } from "@/lib/types";

function parseNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function ModifierCard({
  verb,
  onChange,
}: {
  verb: ModifierVerb;
  onChange: (verb: ModifierVerb) => void;
}) {
  const prefix = `modifier-${verb.id}`;
  const showsPotency = "potencyIncreasePercent" in verb;
  const showsInstances = "instanceMultiplier" in verb;
  const showsSeek = "seeksTarget" in verb;
  const showsChain = "maxTargets" in verb;
  const showsSaturate = "durationMultiplier" in verb;

  return (
    <article className="@container flex flex-col gap-4 rounded border border-line bg-white p-4">
      <header>
        <h3 className="text-base font-semibold tracking-tight">
          {verb.name || "Modifier"}
        </h3>
        <p className="mt-1 text-xs text-ink/45">Modifier verb</p>
      </header>

      <div className="grid grid-cols-1 gap-3 @min-[20rem]:grid-cols-2">
        <CardField
          id={`${prefix}-name`}
          label="Name"
          value={verb.name}
          onChange={(v) => onChange({ ...verb, name: v })}
          className="@min-[20rem]:col-span-2"
        />
        <CardField
          id={`${prefix}-description`}
          label="Description"
          value={verb.description}
          onChange={(v) => onChange({ ...verb, description: v })}
          className="@min-[20rem]:col-span-2"
        />
        <CardField
          id={`${prefix}-manaCost`}
          label="Mana cost"
          type="number"
          value={verb.manaCost}
          onChange={(v) => onChange({ ...verb, manaCost: parseNum(v) })}
        />
        <CardField
          id={`${prefix}-castTime`}
          label="Casting time"
          type="number"
          value={verb.castTime}
          onChange={(v) => onChange({ ...verb, castTime: parseNum(v) })}
        />
        <div className="flex flex-col gap-1 @min-[20rem]:col-span-2">
          <label
            htmlFor={`${prefix}-repeatAllowed`}
            className="flex items-center gap-2 text-xs font-medium text-ink/70"
          >
            <input
              id={`${prefix}-repeatAllowed`}
              name={`${prefix}-repeatAllowed`}
              type="checkbox"
              checked={verb.repeatAllowed}
              onChange={(e) =>
                onChange({ ...verb, repeatAllowed: e.target.checked })
              }
              className="size-4 accent-accent"
            />
            Repeat allowed
          </label>
          <span className="text-[11px] text-ink/45">
            When off, this modifier can appear at most once per spell.
          </span>
        </div>
        {showsPotency && (
          <CardField
            id={`${prefix}-potency`}
            label="Potency increase %"
            type="number"
            hint="Percent potency gain per stack"
            value={verb.potencyIncreasePercent ?? 0}
            onChange={(v) =>
              onChange({ ...verb, potencyIncreasePercent: parseNum(v) })
            }
            className="@min-[20rem]:col-span-2"
          />
        )}
        {showsInstances && (
          <CardField
            id={`${prefix}-instances`}
            label="Instances × / stack"
            type="number"
            hint="Instance multiplier per stack"
            value={verb.instanceMultiplier ?? 1}
            onChange={(v) =>
              onChange({ ...verb, instanceMultiplier: parseNum(v) })
            }
            className="@min-[20rem]:col-span-2"
          />
        )}
        {showsSeek && (
          <p className="text-xs text-ink/50 @min-[20rem]:col-span-2">
            Behavior: arcs toward a target (no potency change).
          </p>
        )}
        {showsChain && (
          <>
            <CardField
              id={`${prefix}-maxTargets`}
              label="Max targets / stack"
              type="number"
              step={1}
              min={0}
              hint="Extra hop targets added per Chain stack"
              value={verb.maxTargets ?? 1}
              onChange={(v) => onChange({ ...verb, maxTargets: parseNum(v) })}
            />
            <CardField
              id={`${prefix}-falloff`}
              label="Potency falloff %"
              type="number"
              hint="Potency lost on each hop"
              value={verb.potencyFalloffPercent ?? 0}
              onChange={(v) =>
                onChange({ ...verb, potencyFalloffPercent: parseNum(v) })
              }
            />
          </>
        )}
        {showsSaturate && (
          <CardField
            id={`${prefix}-duration`}
            label="Duration multiplier"
            type="number"
            hint="Multiplies effect duration per stack"
            value={verb.durationMultiplier ?? 1}
            onChange={(v) =>
              onChange({ ...verb, durationMultiplier: parseNum(v) })
            }
            className="@min-[20rem]:col-span-2"
          />
        )}
      </div>
    </article>
  );
}

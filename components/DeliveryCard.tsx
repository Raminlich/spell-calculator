"use client";

import CardField from "@/components/CardField";
import type { DeliveryVerb } from "@/lib/types";

function parseNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export default function DeliveryCard({
  verb,
  onChange,
}: {
  verb: DeliveryVerb;
  onChange: (verb: DeliveryVerb) => void;
}) {
  const prefix = `delivery-${verb.id}`;

  return (
    <article className="@container flex flex-col gap-4 rounded border border-line bg-white p-4">
      <header>
        <h3 className="text-base font-semibold tracking-tight">
          {verb.name || "Delivery"}
        </h3>
        <p className="mt-1 text-xs text-ink/45">Delivery verb</p>
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
        <CardField
          id={`${prefix}-instances`}
          label="Base instances"
          type="number"
          step={1}
          min={0}
          value={verb.baseInstances}
          onChange={(v) => onChange({ ...verb, baseInstances: parseNum(v) })}
          className="@min-[20rem]:col-span-2"
        />
      </div>
    </article>
  );
}

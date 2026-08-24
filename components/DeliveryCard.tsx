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
    <article className="@container flex min-w-0 flex-col gap-2 rounded border border-line bg-white p-2.5">
      <header className="flex items-center gap-2">
        <CardField
          id={`${prefix}-name`}
          label="Name"
          value={verb.name}
          onChange={(v) => onChange({ ...verb, name: v })}
          variant="title"
          className="min-w-0 flex-1"
        />
        <span className="shrink-0 text-[10px] font-medium uppercase tracking-wide text-ink/40">
          Delivery
        </span>
      </header>

      <div className="grid grid-cols-1 gap-1.5 @min-[15rem]:grid-cols-2">
        <CardField
          id={`${prefix}-description`}
          label="Description"
          value={verb.description}
          onChange={(v) => onChange({ ...verb, description: v })}
          className="@min-[15rem]:col-span-2"
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
          className="@min-[15rem]:col-span-2"
        />
      </div>
    </article>
  );
}

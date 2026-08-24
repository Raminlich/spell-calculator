"use client";

import { useState } from "react";
import CardEnableToggle from "@/components/CardEnableToggle";
import CardField from "@/components/CardField";
import {
  CompactNum,
  ComponentRow,
  KindBadge,
  RowNameInput,
} from "@/components/compactFields";
import type { DeliveryVerb } from "@/lib/types";

export default function DeliveryCard({
  verb,
  onChange,
}: {
  verb: DeliveryVerb;
  onChange: (verb: DeliveryVerb) => void;
}) {
  const prefix = `delivery-${verb.id}`;
  const [expanded, setExpanded] = useState(false);

  return (
    <ComponentRow
      enabled={verb.enabled}
      expanded={expanded}
      onToggleExpand={() => setExpanded((v) => !v)}
      id={verb.id}
      expandContent={
        <>
          <CardField
            id={`${prefix}-description`}
            label="Description"
            value={verb.description}
            onChange={(v) => onChange({ ...verb, description: v })}
          />
          <p className="mt-2 font-mono text-[10px] text-ink/30">{verb.id}</p>
        </>
      }
    >
      <CardEnableToggle
        id={`${prefix}-enabled`}
        checked={verb.enabled}
        onChange={(enabled) => onChange({ ...verb, enabled })}
      />
      <RowNameInput
        id={`${prefix}-name`}
        value={verb.name}
        onChange={(v) => onChange({ ...verb, name: v })}
      />
      <KindBadge>Delivery</KindBadge>
      <CompactNum
        id={`${prefix}-manaCost`}
        label="Mana"
        value={verb.manaCost}
        onChange={(v) => onChange({ ...verb, manaCost: v })}
      />
      <CompactNum
        id={`${prefix}-castTime`}
        label="Cast"
        value={verb.castTime}
        onChange={(v) => onChange({ ...verb, castTime: v })}
        step={0.05}
      />
      <CompactNum
        id={`${prefix}-instances`}
        label="Inst"
        value={verb.baseInstances}
        onChange={(v) => onChange({ ...verb, baseInstances: v })}
        step={1}
        min={0}
      />
    </ComponentRow>
  );
}

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
import type { ModifierVerb } from "@/lib/types";

function modifierKindLabel(verb: ModifierVerb): string {
  if (verb.potencyIncreasePercent != null) return "Potency";
  if (verb.instanceMultiplier != null) return "Split";
  if (verb.seeksTarget) return "Seek";
  if (verb.maxTargets != null) return "Chain";
  if (verb.durationMultiplier != null) return "Duration";
  return "Modifier";
}

export default function ModifierCard({
  verb,
  onChange,
}: {
  verb: ModifierVerb;
  onChange: (verb: ModifierVerb) => void;
}) {
  const prefix = `modifier-${verb.id}`;
  const [expanded, setExpanded] = useState(false);
  const showsPotency = verb.potencyIncreasePercent != null;
  const showsInstances = verb.instanceMultiplier != null;
  const showsSeek = verb.seeksTarget === true;
  const showsChain = verb.maxTargets != null;
  const showsSaturate = verb.durationMultiplier != null;

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
            className="mb-2"
          />
          <label
            htmlFor={`${prefix}-repeatAllowed`}
            title="When off, this modifier can appear at most once per spell."
            className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-ink/70"
          >
            <input
              id={`${prefix}-repeatAllowed`}
              name={`${prefix}-repeatAllowed`}
              type="checkbox"
              checked={verb.repeatAllowed}
              onChange={(e) =>
                onChange({ ...verb, repeatAllowed: e.target.checked })
              }
              className="size-3.5 accent-accent"
            />
            Repeat allowed
          </label>
          {showsSeek ? (
            <p className="text-[11px] text-ink/50">
              Arcs toward a target — no potency change.
            </p>
          ) : null}
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
      <KindBadge>{modifierKindLabel(verb)}</KindBadge>
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
      {showsPotency ? (
        <CompactNum
          id={`${prefix}-potency`}
          label="Pot %"
          value={verb.potencyIncreasePercent ?? 0}
          onChange={(v) => onChange({ ...verb, potencyIncreasePercent: v })}
          step={1}
        />
      ) : null}
      {showsInstances ? (
        <CompactNum
          id={`${prefix}-instances`}
          label="× inst"
          value={verb.instanceMultiplier ?? 1}
          onChange={(v) => onChange({ ...verb, instanceMultiplier: v })}
          step={0.1}
        />
      ) : null}
      {showsChain ? (
        <>
          <CompactNum
            id={`${prefix}-maxTargets`}
            label="Tgt"
            value={verb.maxTargets ?? 1}
            onChange={(v) => onChange({ ...verb, maxTargets: v })}
            step={1}
            min={0}
          />
          <CompactNum
            id={`${prefix}-falloff`}
            label="Fall %"
            value={verb.potencyFalloffPercent ?? 0}
            onChange={(v) => onChange({ ...verb, potencyFalloffPercent: v })}
            step={1}
          />
        </>
      ) : null}
      {showsSaturate ? (
        <CompactNum
          id={`${prefix}-duration`}
          label="Dur ×"
          value={verb.durationMultiplier ?? 1}
          onChange={(v) => onChange({ ...verb, durationMultiplier: v })}
          step={0.1}
        />
      ) : null}
    </ComponentRow>
  );
}

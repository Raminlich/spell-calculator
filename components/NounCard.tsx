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
import type { Noun } from "@/lib/types";

export default function NounCard({
  noun,
  onChange,
}: {
  noun: Noun;
  onChange: (noun: Noun) => void;
}) {
  const prefix = `noun-${noun.id}`;
  const status = noun.statusEffect;
  const [expanded, setExpanded] = useState(false);

  return (
    <ComponentRow
      enabled={noun.enabled}
      expanded={expanded}
      onToggleExpand={() => setExpanded((v) => !v)}
      id={noun.id}
      expandContent={
        <>
          <CardField
            id={`${prefix}-description`}
            label="Description"
            value={noun.description}
            onChange={(v) => onChange({ ...noun, description: v })}
            className="mb-2"
          />
          {status ? (
            <CardField
              id={`${prefix}-bleed`}
              label="Potency bleed %"
              type="number"
              hint="Of potency gained above base: this % → effect, rest → damage"
              value={noun.potencyBleedPercent}
              onChange={(v) =>
                onChange({ ...noun, potencyBleedPercent: parseFloat(v) || 0 })
              }
              className="mb-3"
            />
          ) : null}
          {status ? (
            <div>
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-ink/45">
                Status effect · {status.kind}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <CardField
                  id={`${prefix}-status-name`}
                  label="Effect name"
                  value={status.name}
                  onChange={(v) =>
                    onChange({
                      ...noun,
                      statusEffect: { ...status, name: v },
                    })
                  }
                  className="sm:col-span-2"
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
                      statusEffect: {
                        ...status,
                        potency: parseFloat(v) || 0,
                      },
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
                      statusEffect: {
                        ...status,
                        duration: parseFloat(v) || 0,
                      },
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
                        statusEffect: {
                          ...status,
                          damage: parseFloat(v) || 0,
                        },
                      })
                    }
                    className="sm:col-span-2"
                  />
                ) : (
                  <CardField
                    id={`${prefix}-status-slow`}
                    label="Slow % @ base"
                    type="number"
                    hint="Slow amount when effect potency equals base"
                    value={status.slowAmountPercent}
                    onChange={(v) =>
                      onChange({
                        ...noun,
                        statusEffect: {
                          ...status,
                          slowAmountPercent: parseFloat(v) || 0,
                        },
                      })
                    }
                    className="sm:col-span-2"
                  />
                )}
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-ink/45">No status effect.</p>
          )}
          <p className="mt-2 font-mono text-[10px] text-ink/30">{noun.id}</p>
        </>
      }
    >
      <CardEnableToggle
        id={`${prefix}-enabled`}
        checked={noun.enabled}
        onChange={(enabled) => onChange({ ...noun, enabled })}
      />
      <RowNameInput
        id={`${prefix}-name`}
        value={noun.name}
        onChange={(v) => onChange({ ...noun, name: v })}
      />
      <KindBadge>{status ? status.kind : "Pure dmg"}</KindBadge>
      <CompactNum
        id={`${prefix}-potency`}
        label="Pot"
        value={noun.potency}
        onChange={(v) => onChange({ ...noun, potency: v })}
      />
      <CompactNum
        id={`${prefix}-damage`}
        label="Dmg"
        value={noun.damage}
        onChange={(v) => onChange({ ...noun, damage: v })}
      />
      <CompactNum
        id={`${prefix}-manaCost`}
        label="Mana"
        value={noun.manaCost}
        onChange={(v) => onChange({ ...noun, manaCost: v })}
      />
      <CompactNum
        id={`${prefix}-castTime`}
        label="Cast"
        value={noun.castTime}
        onChange={(v) => onChange({ ...noun, castTime: v })}
        step={0.05}
      />
    </ComponentRow>
  );
}

"use client";

import { useMemo, useState } from "react";
import { SpellCombo } from "@/lib/types";

type ColumnDef = {
  key: string;
  label: string;
  align?: "left" | "right";
  get: (c: SpellCombo) => string | number;
  format?: (c: SpellCombo) => string;
};

const columns: ColumnDef[] = [
  { key: "label", label: "Spell", align: "left", get: (c) => c.label },
  { key: "noun", label: "Noun", align: "left", get: (c) => c.noun.name },
  { key: "delivery", label: "Delivery", align: "left", get: (c) => c.delivery.name },
  {
    key: "totalModifiers",
    label: "Modifiers",
    align: "right",
    get: (c) => c.totalModifiers,
  },
  {
    key: "manaCost",
    label: "Mana cost",
    align: "right",
    get: (c) => c.manaCost,
    format: (c) => c.manaCost.toFixed(1),
  },
  {
    key: "castTime",
    label: "Cast time",
    align: "right",
    get: (c) => c.castTime,
    format: (c) => c.castTime.toFixed(2) + "s",
  },
  { key: "instances", label: "Instances", align: "right", get: (c) => c.instances },
  {
    key: "potencyPool",
    label: "Potency pool",
    align: "right",
    get: (c) => c.potencyPool,
    format: (c) => c.potencyPool.toFixed(1),
  },
  {
    key: "potencyPerInstance",
    label: "Potency / instance",
    align: "right",
    get: (c) => c.potencyPerInstance,
    format: (c) => c.potencyPerInstance.toFixed(2),
  },
  {
    key: "efficiency",
    label: "Potency / mana",
    align: "right",
    get: (c) => (c.manaCost > 0 ? c.potencyPool / c.manaCost : 0),
    format: (c) => (c.manaCost > 0 ? (c.potencyPool / c.manaCost).toFixed(3) : "—"),
  },
];

export default function SpellTable({ combos }: { combos: SpellCombo[] }) {
  const [sortKey, setSortKey] = useState<string>("manaCost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return combos;
    const withValues = combos.map((c) => ({ c, v: col.get(c) }));
    withValues.sort((a, b) => {
      if (typeof a.v === "number" && typeof b.v === "number") {
        return a.v - b.v;
      }
      return String(a.v).localeCompare(String(b.v));
    });
    if (sortDir === "desc") withValues.reverse();
    return withValues.map((w) => w.c);
  }, [combos, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className="overflow-auto rounded border border-line bg-white">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="sticky top-0 bg-paper">
          <tr className="border-b border-line">
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => toggleSort(col.key)}
                className={`cursor-pointer select-none whitespace-nowrap px-3 py-2 font-medium text-ink/70 hover:text-ink ${
                  col.align === "right" ? "text-right" : "text-left"
                }`}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-accent">
                    {sortDir === "asc" ? "\u2191" : "\u2193"}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => (
            <tr key={c.key} className="border-b border-line/60 last:border-0 hover:bg-paper/60">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap px-3 py-1.5 font-mono text-[13px] ${
                    col.align === "right" ? "text-right" : "text-left font-sans"
                  }`}
                >
                  {col.format ? col.format(c) : String(col.get(c))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {sorted.length === 0 && (
        <div className="p-6 text-center text-sm text-ink/50">
          No combinations match the current limits.
        </div>
      )}
    </div>
  );
}

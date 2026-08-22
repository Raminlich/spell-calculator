"use client";

import { useMemo, useState } from "react";
import { SpellCombo } from "@/lib/types";
import {
  exportCombosTable,
  type TableExportFormat,
} from "@/lib/tableExport";

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
    key: "seeksTarget",
    label: "Seek",
    align: "left",
    get: (c) => (c.seeksTarget ? "yes" : "—"),
  },
  {
    key: "chainTargets",
    label: "Targets",
    align: "right",
    get: (c) => c.chainTargets,
  },
  {
    key: "chainLastHop",
    label: "Last hop pot.",
    align: "right",
    get: (c) => c.potencyPerInstance * c.chainLastHopFactor,
    format: (c) =>
      c.chainTargets > 1
        ? (c.potencyPerInstance * c.chainLastHopFactor).toFixed(2)
        : "—",
  },
  {
    key: "potencyPool",
    label: "Potency pool",
    align: "right",
    get: (c) => c.potencyPool,
    format: (c) => c.potencyPool.toFixed(1),
  },
  {
    key: "potencyPerInstance",
    label: "Potency / inst",
    align: "right",
    get: (c) => c.potencyPerInstance,
    format: (c) => c.potencyPerInstance.toFixed(2),
  },
  {
    key: "damagePerInstance",
    label: "Dmg / inst",
    align: "right",
    get: (c) => c.damagePerInstance,
    format: (c) => c.damagePerInstance.toFixed(2),
  },
  {
    key: "effect",
    label: "Effect",
    align: "left",
    get: (c) => c.effect.name,
  },
  {
    key: "effectPotency",
    label: "Effect pot.",
    align: "right",
    get: (c) => c.effect.potency,
    format: (c) => c.effect.potency.toFixed(2),
  },
  {
    key: "effectDuration",
    label: "Duration",
    align: "right",
    get: (c) => c.effect.duration,
    format: (c) => c.effect.duration.toFixed(1) + "s",
  },
  {
    key: "effectOutput",
    label: "Burn dmg / Slow %",
    align: "right",
    get: (c) =>
      c.effect.kind === "burn"
        ? (c.effect.damage ?? c.effect.potency)
        : (c.effect.slowAmountPercent ?? c.effect.potency),
    format: (c) => {
      if (c.effect.kind === "burn") {
        return (c.effect.damage ?? c.effect.potency).toFixed(2) + " dmg";
      }
      return (c.effect.slowAmountPercent ?? c.effect.potency).toFixed(1) + "%";
    },
  },
  {
    key: "efficiency",
    label: "Potency / mana",
    align: "right",
    get: (c) => (c.manaCost > 0 ? c.potencyPool / c.manaCost : 0),
    format: (c) => (c.manaCost > 0 ? (c.potencyPool / c.manaCost).toFixed(3) : "—"),
  },
];

type FilterOption = { id: string; name: string };

export default function SpellTable({
  combos,
  nounOptions,
  deliveryOptions,
}: {
  combos: SpellCombo[];
  nounOptions: FilterOption[];
  deliveryOptions: FilterOption[];
}) {
  const [sortKey, setSortKey] = useState<string>("manaCost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [nounFilter, setNounFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [exportFormat, setExportFormat] = useState<TableExportFormat>("csv");

  const filtered = useMemo(() => {
    return combos.filter((c) => {
      if (nounFilter !== "all" && c.noun.id !== nounFilter) return false;
      if (deliveryFilter !== "all" && c.delivery.id !== deliveryFilter) return false;
      return true;
    });
  }, [combos, nounFilter, deliveryFilter]);

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const withValues = filtered.map((c) => ({ c, v: col.get(c) }));
    withValues.sort((a, b) => {
      if (typeof a.v === "number" && typeof b.v === "number") {
        return a.v - b.v;
      }
      return String(a.v).localeCompare(String(b.v));
    });
    if (sortDir === "desc") withValues.reverse();
    return withValues.map((w) => w.c);
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: string) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filtersActive = nounFilter !== "all" || deliveryFilter !== "all";

  return (
    <div className="rounded border border-line bg-white">
      <div className="flex flex-wrap items-end gap-4 border-b border-line px-3 py-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-noun" className="text-xs font-medium text-ink/70">
            Noun
          </label>
          <select
            id="filter-noun"
            name="filter-noun"
            value={nounFilter}
            onChange={(e) => setNounFilter(e.target.value)}
            className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">All nouns</option>
            {nounOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-delivery" className="text-xs font-medium text-ink/70">
            Delivery
          </label>
          <select
            id="filter-delivery"
            name="filter-delivery"
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="all">All deliveries</option>
            {deliveryOptions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setNounFilter("all");
              setDeliveryFilter("all");
            }}
            className="rounded border border-line px-3 py-2 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
          >
            Clear filters
          </button>
        )}
        <div className="ms-auto flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="export-format" className="text-xs font-medium text-ink/70">
              Export
            </label>
            <select
              id="export-format"
              name="export-format"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as TableExportFormat)}
              className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <option value="csv">CSV</option>
              <option value="tsv">TSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button
            type="button"
            disabled={sorted.length === 0}
            onClick={() => exportCombosTable(sorted, columns, exportFormat)}
            className="min-h-10 rounded border border-line px-3 py-2 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
          <span className="self-center text-xs text-ink/50">
            Showing {sorted.length.toLocaleString()} of {combos.length.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-[1100px] text-sm">
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
              <tr
                key={c.key}
                className="border-b border-line/60 last:border-0 hover:bg-paper/60"
              >
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
            No combinations match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

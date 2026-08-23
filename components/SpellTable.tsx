"use client";

import { useEffect, useMemo, useState } from "react";
import { GlobalConfig, SpellCombo } from "@/lib/types";
import {
  exportCombosTable,
  type TableExportFormat,
} from "@/lib/tableExport";
import {
  parseRadarAxisSortKey,
  radarAxisSortKey,
  RADAR_AXIS_OPTIONS,
  scoreSpellRadar,
  type RadarAxisId,
} from "@/lib/radarScore";
import SpellRadarDialog from "@/components/SpellRadarDialog";

type ColumnGroupId =
  | "identity"
  | "cost"
  | "damage"
  | "potency"
  | "targeting"
  | "effects";

type ColumnDef = {
  key: string;
  label: string;
  group: ColumnGroupId;
  align?: "left" | "right";
  get: (c: SpellCombo) => string | number;
  format?: (c: SpellCombo) => string;
};

const COLUMN_GROUPS: { id: ColumnGroupId; label: string }[] = [
  { id: "identity", label: "Identity" },
  { id: "cost", label: "Cost" },
  { id: "damage", label: "Damage" },
  { id: "potency", label: "Potency" },
  { id: "targeting", label: "Targeting" },
  { id: "effects", label: "Effects" },
];

const ALL_GROUP_IDS = COLUMN_GROUPS.map((g) => g.id);

const columns: ColumnDef[] = [
  { key: "label", label: "Spell", group: "identity", align: "left", get: (c) => c.label },
  { key: "noun", label: "Noun", group: "identity", align: "left", get: (c) => c.noun.name },
  {
    key: "delivery",
    label: "Delivery",
    group: "identity",
    align: "left",
    get: (c) => c.delivery.name,
  },
  {
    key: "totalModifiers",
    label: "Modifiers",
    group: "identity",
    align: "right",
    get: (c) => c.totalModifiers,
  },
  {
    key: "manaCost",
    label: "Mana Cost",
    group: "cost",
    align: "right",
    get: (c) => c.manaCost,
    format: (c) => c.manaCost.toFixed(1),
  },
  {
    key: "castTime",
    label: "Cast Time",
    group: "cost",
    align: "right",
    get: (c) => c.castTime,
    format: (c) => c.castTime.toFixed(2) + "s",
  },
  {
    key: "manaPerSecond",
    label: "Mana / Second",
    group: "cost",
    align: "right",
    get: (c) => c.manaPerSecond,
    format: (c) => (c.castTime > 0 ? c.manaPerSecond.toFixed(2) : "—"),
  },
  {
    key: "instances",
    label: "Instances",
    group: "damage",
    align: "right",
    get: (c) => c.instances,
  },
  {
    key: "damagePerInstance",
    label: "Damage / Instance",
    group: "damage",
    align: "right",
    get: (c) => c.damagePerInstance,
    format: (c) => c.damagePerInstance.toFixed(2),
  },
  {
    key: "totalDamage",
    label: "Total Damage",
    group: "damage",
    align: "right",
    get: (c) => c.totalDamage,
    format: (c) => c.totalDamage.toFixed(2),
  },
  {
    key: "damagePerMana",
    label: "Damage / Mana",
    group: "damage",
    align: "right",
    get: (c) => c.damagePerMana,
    format: (c) => (c.manaCost > 0 ? c.damagePerMana.toFixed(3) : "—"),
  },
  {
    key: "potencyPool",
    label: "Potency Pool",
    group: "potency",
    align: "right",
    get: (c) => c.potencyPool,
    format: (c) => c.potencyPool.toFixed(1),
  },
  {
    key: "potencyPerInstance",
    label: "Potency / Instance",
    group: "potency",
    align: "right",
    get: (c) => c.potencyPerInstance,
    format: (c) => c.potencyPerInstance.toFixed(2),
  },
  {
    key: "potencyPerMana",
    label: "Potency / Mana",
    group: "potency",
    align: "right",
    get: (c) => c.potencyPerMana,
    format: (c) => (c.manaCost > 0 ? c.potencyPerMana.toFixed(3) : "—"),
  },
  {
    key: "potencyPerSecond",
    label: "Potency / Second",
    group: "potency",
    align: "right",
    get: (c) => c.potencyPerSecond,
    format: (c) => (c.castTime > 0 ? c.potencyPerSecond.toFixed(2) : "—"),
  },
  {
    key: "lastHopPotency",
    label: "Last Hop Potency",
    group: "potency",
    align: "right",
    get: (c) => c.lastHopPotency,
    format: (c) =>
      c.chainTargets > 1 ? c.lastHopPotency.toFixed(2) : "—",
  },
  {
    key: "seeksTarget",
    label: "Seek",
    group: "targeting",
    align: "left",
    get: (c) => (c.seeksTarget ? "yes" : "—"),
  },
  {
    key: "chainTargets",
    label: "Targets",
    group: "targeting",
    align: "right",
    get: (c) => c.chainTargets,
  },
  {
    key: "effect",
    label: "Effect",
    group: "effects",
    align: "left",
    get: (c) => c.effect.name,
  },
  {
    key: "effectPotency",
    label: "Effect Potency",
    group: "effects",
    align: "right",
    get: (c) => c.effect.potency,
    format: (c) => c.effect.potency.toFixed(2),
  },
  {
    key: "effectDuration",
    label: "Duration",
    group: "effects",
    align: "right",
    get: (c) => c.effect.duration,
    format: (c) => c.effect.duration.toFixed(1) + "s",
  },
  {
    key: "effectOutput",
    label: "Burn Damage / Slow %",
    group: "effects",
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
];

type FilterOption = { id: string; name: string };

type RadarSearchAxis = RadarAxisId | "total" | "none";
type RadarSearchRank = "best" | "worst";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500] as const;

export default function SpellTable({
  combos,
  config,
  nounOptions,
  deliveryOptions,
  modifierOptions,
}: {
  combos: SpellCombo[];
  config: GlobalConfig;
  nounOptions: FilterOption[];
  deliveryOptions: FilterOption[];
  modifierOptions: FilterOption[];
}) {
  const [sortKey, setSortKey] = useState<string>("manaCost");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [nounFilter, setNounFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [modifierFilter, setModifierFilter] = useState<Set<string>>(
    () => new Set()
  );
  const [modifierFilterExclusive, setModifierFilterExclusive] = useState(false);
  const [exportFormat, setExportFormat] = useState<TableExportFormat>("csv");
  const [activeGroups, setActiveGroups] = useState<Set<ColumnGroupId>>(
    () => new Set(ALL_GROUP_IDS)
  );
  const [radarCombo, setRadarCombo] = useState<SpellCombo | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(50);
  const [radarSearchAxis, setRadarSearchAxis] = useState<RadarSearchAxis>("none");
  const [radarSearchRank, setRadarSearchRank] = useState<RadarSearchRank>("best");

  const activeRadarAxisId = parseRadarAxisSortKey(sortKey);

  const visibleColumns = useMemo(
    () => columns.filter((col) => activeGroups.has(col.group)),
    [activeGroups]
  );

  const filtered = useMemo(() => {
    return combos.filter((c) => {
      if (nounFilter !== "all" && c.noun.id !== nounFilter) return false;
      if (deliveryFilter !== "all" && c.delivery.id !== deliveryFilter) return false;
      if (modifierFilter.size > 0) {
        if (modifierFilterExclusive) {
          for (const id of modifierFilter) {
            if (c.modifierCounts[id] > 0) return false;
          }
        } else {
          for (const id of modifierFilter) {
            if (!(c.modifierCounts[id] > 0)) return false;
          }
        }
      }
      return true;
    });
  }, [
    combos,
    nounFilter,
    deliveryFilter,
    modifierFilter,
    modifierFilterExclusive,
  ]);

  const needsFullRadarSort =
    sortKey === "radarScore" || activeRadarAxisId !== null;

  const fullRadarScores = useMemo(() => {
    if (!needsFullRadarSort) return null;
    const map = new Map<
      string,
      {
        total: number;
        max: number;
        axes: Map<RadarAxisId, { score: number; normalized: number }>;
      }
    >();
    for (const c of filtered) {
      const radar = scoreSpellRadar(c, config);
      map.set(c.key, {
        total: radar.totalScore,
        max: radar.maxTotalScore,
        axes: new Map(
          radar.axes.map((axis) => [
            axis.id,
            { score: axis.score, normalized: axis.normalized },
          ])
        ),
      });
    }
    return map;
  }, [filtered, needsFullRadarSort, config]);

  const sorted = useMemo(() => {
    const withValues = filtered.map((c) => {
      if (sortKey === "radarScore") {
        return { c, v: fullRadarScores?.get(c.key)?.total ?? 0 };
      }
      if (activeRadarAxisId) {
        return {
          c,
          v:
            fullRadarScores?.get(c.key)?.axes.get(activeRadarAxisId)
              ?.normalized ?? 0,
        };
      }
      const col = columns.find((column) => column.key === sortKey);
      return { c, v: col ? col.get(c) : 0 };
    });
    withValues.sort((a, b) => {
      if (typeof a.v === "number" && typeof b.v === "number") {
        return a.v - b.v;
      }
      return String(a.v).localeCompare(String(b.v));
    });
    if (sortDir === "desc") withValues.reverse();
    return withValues.map((w) => w.c);
  }, [filtered, sortKey, sortDir, fullRadarScores, activeRadarAxisId]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const radarScores = useMemo(() => {
    const map = new Map<string, { total: number; max: number }>();
    if (fullRadarScores) {
      for (const [key, value] of fullRadarScores) {
        map.set(key, { total: value.total, max: value.max });
      }
    }
    for (const c of paginated) {
      if (map.has(c.key)) continue;
      const radar = scoreSpellRadar(c, config);
      map.set(c.key, {
        total: radar.totalScore,
        max: radar.maxTotalScore,
      });
    }
    return map;
  }, [fullRadarScores, paginated, config]);

  const pageStart = sorted.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, sorted.length);

  useEffect(() => {
    setPage(1);
  }, [
    nounFilter,
    deliveryFilter,
    modifierFilter,
    modifierFilterExclusive,
    sortKey,
    sortDir,
    pageSize,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  function applyRadarSearch(axis: RadarSearchAxis, rank: RadarSearchRank) {
    setRadarSearchAxis(axis);
    setRadarSearchRank(rank);
    if (axis === "none") return;
    const dir = rank === "best" ? "desc" : "asc";
    if (axis === "total") {
      setSortKey("radarScore");
    } else {
      setSortKey(radarAxisSortKey(axis));
    }
    setSortDir(dir);
  }

  function toggleSort(key: string) {
    setRadarSearchAxis("none");
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "radarScore" ? "desc" : "asc");
    }
  }

  function toggleGroup(id: ColumnGroupId) {
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleModifier(id: string) {
    setModifierFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filtersActive =
    nounFilter !== "all" ||
    deliveryFilter !== "all" ||
    modifierFilter.size > 0;
  const allGroupsActive = activeGroups.size === ALL_GROUP_IDS.length;
  const radarSearchActive = radarSearchAxis !== "none";
  const activeRadarAxisLabel = activeRadarAxisId
    ? RADAR_AXIS_OPTIONS.find((axis) => axis.id === activeRadarAxisId)?.shortLabel
    : null;

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
        <div className="flex min-w-[12rem] flex-col gap-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              id="filter-modifiers-label"
              className="text-xs font-medium text-ink/70"
            >
              Modifiers
              {modifierFilter.size > 0 ? ` (${modifierFilter.size})` : ""}
            </span>
            <label
              htmlFor="filter-modifiers-exclusive"
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink/65"
              title={
                modifierFilterExclusive
                  ? "Hide spells that include any selected modifier"
                  : "Show only spells that include all selected modifiers"
              }
            >
              <input
                id="filter-modifiers-exclusive"
                name="filter-modifiers-exclusive"
                type="checkbox"
                checked={modifierFilterExclusive}
                onChange={(e) => setModifierFilterExclusive(e.target.checked)}
                className="size-3.5 rounded border-line accent-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              />
              Exclusive
            </label>
          </div>
          <div
            role="group"
            aria-labelledby="filter-modifiers-label"
            className="flex flex-wrap gap-1.5"
          >
            {modifierOptions.map((mod) => {
              const pressed = modifierFilter.has(mod.id);
              return (
                <button
                  key={mod.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggleModifier(mod.id)}
                  className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    pressed
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-line text-ink/55 hover:border-ink/30 hover:text-ink"
                  }`}
                >
                  {mod.name}
                </button>
              );
            })}
          </div>
        </div>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setNounFilter("all");
              setDeliveryFilter("all");
              setModifierFilter(new Set());
              setModifierFilterExclusive(false);
            }}
            className="rounded border border-line px-3 py-2 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
          >
            Clear filters
          </button>
        )}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="radar-search-axis"
            className="text-xs font-medium text-ink/70"
          >
            Radar axis
          </label>
          <select
            id="radar-search-axis"
            name="radar-search-axis"
            value={radarSearchAxis}
            onChange={(e) =>
              applyRadarSearch(
                e.target.value as RadarSearchAxis,
                radarSearchRank
              )
            }
            className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <option value="none">—</option>
            <option value="total">Total score</option>
            {RADAR_AXIS_OPTIONS.map((axis) => (
              <option key={axis.id} value={axis.id}>
                {axis.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label
            htmlFor="radar-search-rank"
            className="text-xs font-medium text-ink/70"
          >
            Rank
          </label>
          <select
            id="radar-search-rank"
            name="radar-search-rank"
            value={radarSearchRank}
            disabled={!radarSearchActive}
            onChange={(e) =>
              applyRadarSearch(
                radarSearchAxis,
                e.target.value as RadarSearchRank
              )
            }
            className="min-h-10 rounded border border-line bg-white px-2.5 py-2 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="best">Best first</option>
            <option value="worst">Worst first</option>
          </select>
        </div>
        {radarSearchActive && (
          <button
            type="button"
            onClick={() => applyRadarSearch("none", radarSearchRank)}
            className="rounded border border-line px-2 py-1 text-[10px] font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
          >
            Clear radar sort
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
            disabled={sorted.length === 0 || visibleColumns.length === 0}
            onClick={() => exportCombosTable(sorted, visibleColumns, exportFormat)}
            className="min-h-10 rounded border border-line px-3 py-2 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download
          </button>
          <span className="self-center text-xs text-ink/50">
            {sorted.length === 0
              ? `0 of ${combos.length.toLocaleString()}`
              : `${pageStart.toLocaleString()}–${pageEnd.toLocaleString()} of ${sorted.length.toLocaleString()} (${combos.length.toLocaleString()} total)`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
        <span className="text-xs font-medium uppercase tracking-wide text-ink/50">
          Column groups
        </span>
        <div
          role="group"
          aria-label="Column group filters"
          className="flex flex-wrap gap-1.5"
        >
          {COLUMN_GROUPS.map((group) => {
            const pressed = activeGroups.has(group.id);
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => toggleGroup(group.id)}
                className={`rounded border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  pressed
                    ? "border-accent bg-accent/10 text-ink"
                    : "border-line text-ink/35 hover:border-ink/25 hover:text-ink/55"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
        {!allGroupsActive && (
          <button
            type="button"
            onClick={() => setActiveGroups(new Set(ALL_GROUP_IDS))}
            className="text-xs font-medium text-ink/55 hover:text-ink"
          >
            Show all
          </button>
        )}
      </div>

      <div className="overflow-auto">
        {visibleColumns.length === 0 ? (
          <div className="p-6 text-center text-sm text-ink/50">
            No column groups selected. Enable one or more groups above.
          </div>
        ) : (
          <table className="w-full min-w-[1100px] text-sm">
            <caption className="sr-only">Generated spell combinations</caption>
            <thead className="sticky top-0 bg-paper">
              <tr className="border-b border-line">
                <th
                  scope="col"
                  onClick={() => toggleSort("radarScore")}
                  className="cursor-pointer select-none whitespace-nowrap px-2 py-2 text-left font-medium text-ink/70 hover:text-ink"
                >
                  {activeRadarAxisLabel ?? "Score"}
                  {(sortKey === "radarScore" || activeRadarAxisId) && (
                    <span className="ml-1 text-accent">
                      {sortDir === "asc" ? "\u2191" : "\u2193"}
                    </span>
                  )}
                </th>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
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
              {paginated.map((c) => {
                const score = radarScores.get(c.key);
                const axisScore = activeRadarAxisId
                  ? fullRadarScores?.get(c.key)?.axes.get(activeRadarAxisId)
                  : null;
                const displayScore =
                  sortKey === "radarScore"
                    ? score
                    : axisScore
                      ? { total: axisScore.score, max: 0, normalized: axisScore.normalized }
                      : score;
                return (
                <tr
                  key={c.key}
                  className="border-b border-line/60 last:border-0 hover:bg-paper/60"
                >
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label={`Open radar for ${c.label}`}
                        title="Radar score"
                        onClick={() => setRadarCombo(c)}
                        className="inline-flex size-7 shrink-0 items-center justify-center rounded border border-line text-ink/45 transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          aria-hidden="true"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.4"
                        >
                          <polygon points="8,1.5 14.5,5.5 12,13.5 4,13.5 1.5,5.5" />
                          <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                          <line x1="8" y1="8" x2="8" y2="1.5" />
                          <line x1="8" y1="8" x2="14.5" y2="5.5" />
                          <line x1="8" y1="8" x2="4" y2="13.5" />
                        </svg>
                      </button>
                      <span
                        className="font-mono text-[13px] tabular-nums text-ink/80"
                        title={
                          displayScore
                            ? activeRadarAxisId
                              ? `${activeRadarAxisLabel} ${displayScore.total.toFixed(1)} (${(displayScore.normalized * 100).toFixed(0)}%)`
                              : `Score ${displayScore.total.toFixed(1)} / ${displayScore.max.toFixed(0)}`
                            : undefined
                        }
                      >
                        {displayScore ? displayScore.total.toFixed(1) : "—"}
                      </span>
                    </div>
                  </td>
                  {visibleColumns.map((col) => (
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
                );
              })}
            </tbody>
          </table>
        )}
        {visibleColumns.length > 0 && sorted.length === 0 && (
          <div className="p-6 text-center text-sm text-ink/50">
            No combinations match the current filters.
          </div>
        )}
      </div>

      {visibleColumns.length > 0 && sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-3 py-2.5">
          <div className="flex items-center gap-2">
            <label htmlFor="table-page-size" className="text-xs font-medium text-ink/70">
              Rows per page
            </label>
            <select
              id="table-page-size"
              name="table-page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="min-h-9 rounded border border-line bg-white px-2 py-1.5 text-sm focus:border-accent focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="min-h-9 rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="font-mono text-xs tabular-nums text-ink/55">
              Page {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="min-h-9 rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/70 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <SpellRadarDialog
        combo={radarCombo}
        config={config}
        open={radarCombo !== null}
        onClose={() => setRadarCombo(null)}
      />
    </div>
  );
}

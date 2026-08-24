"use client";

import { useState } from "react";
import CardEnableToggle from "@/components/CardEnableToggle";
import { CompactNum, parseNum } from "@/components/compactFields";
import {
  collectEffectKindOptions,
  defaultMetricForSource,
  defaultRadarMetrics,
  RADAR_AXIS_OPTIONS,
  RADAR_SOURCE_OPTIONS,
  type RadarAxisId,
  type RadarMetric,
  type RadarMetricEnumMap,
  type RadarSourceId,
} from "@/lib/radarMetrics";
import type { Noun } from "@/lib/types";

type Option = { id: string; label: string };

const CURVE_LABELS: Record<RadarMetric["curve"], string> = {
  higherBetter: "Higher ↑",
  lowerBetter: "Lower ↓",
  booleanMap: "Yes / No",
  enumMap: "Mapped",
  matchOne: "Match",
};

function EnumMapEditor({
  metric,
  keyOptions,
  onChange,
}: {
  metric: RadarMetricEnumMap;
  keyOptions: Option[];
  onChange: (metric: RadarMetricEnumMap) => void;
}) {
  const entries = Object.entries(metric.values);

  function setEntry(key: string, score: number) {
    onChange({ ...metric, values: { ...metric.values, [key]: score } });
  }

  function removeEntry(key: string) {
    const next = { ...metric.values };
    delete next[key];
    onChange({ ...metric, values: next });
  }

  function addEntry() {
    const unused = keyOptions.find((o) => !(o.id in metric.values));
    if (!unused) return;
    setEntry(unused.id, 0);
  }

  return (
    <div className="flex flex-col gap-2 pt-1">
      <p className="text-[10px] font-medium uppercase tracking-wide text-ink/45">
        Value mappings
      </p>
      {entries.length === 0 ? (
        <p className="text-[11px] text-ink/45">No mappings yet.</p>
      ) : (
        entries.map(([key, score]) => (
          <div key={key} className="flex flex-wrap items-center gap-2">
            <select
              value={key}
              onChange={(e) => {
                const newKey = e.target.value;
                const next = { ...metric.values };
                delete next[key];
                next[newKey] = score;
                onChange({ ...metric, values: next });
              }}
              className="min-h-6 rounded border border-line bg-white px-1.5 py-0.5 text-xs"
            >
              {keyOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
              {!keyOptions.some((o) => o.id === key) ? (
                <option value={key}>{key}</option>
              ) : null}
            </select>
            <CompactNum
              id={`radar-${metric.id}-enum-${key}`}
              label="Score"
              value={score}
              onChange={(v) => setEntry(key, v)}
            />
            <button
              type="button"
              onClick={() => removeEntry(key)}
              className="text-[10px] text-ink/45 hover:text-warn"
            >
              Remove
            </button>
          </div>
        ))
      )}
      {entries.length < keyOptions.length ? (
        <button
          type="button"
          onClick={addEntry}
          className="self-start text-[10px] font-medium text-ink/55 hover:text-ink"
        >
          + Add mapping
        </button>
      ) : null}
    </div>
  );
}

function MetricRowControls({
  metric,
  modifierOptions,
  effectKindOptions,
  deliveryOptions,
  onChange,
}: {
  metric: RadarMetric;
  modifierOptions: Option[];
  effectKindOptions: Option[];
  deliveryOptions: Option[];
  onChange: (metric: RadarMetric) => void;
}) {
  const matchKeyOptions =
    metric.source === "effectKind"
      ? effectKindOptions
      : metric.source === "deliveryId"
        ? deliveryOptions
        : [];

  if (metric.curve === "higherBetter" || metric.curve === "lowerBetter") {
    return (
      <>
        {metric.source === "modifierStacks" ? (
          <label className="inline-flex items-center gap-1 text-[11px] text-ink/55">
            <span className="text-ink/45">Mod</span>
            <select
              value={metric.modifierId ?? ""}
              onChange={(e) =>
                onChange({ ...metric, modifierId: e.target.value })
              }
              className="min-h-6 max-w-[6rem] rounded border border-line bg-white px-1.5 py-0.5 text-xs"
            >
              {modifierOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <CompactNum
          id={`radar-${metric.id}-halfAt`}
          label="Mid"
          value={metric.halfAt}
          onChange={(v) => onChange({ ...metric, halfAt: v })}
          step={metric.halfAt < 2 ? 0.05 : 1}
        />
      </>
    );
  }

  if (metric.curve === "booleanMap") {
    return (
      <>
        <CompactNum
          id={`radar-${metric.id}-whenTrue`}
          label="Yes"
          value={metric.whenTrue}
          onChange={(v) => onChange({ ...metric, whenTrue: v })}
        />
        <CompactNum
          id={`radar-${metric.id}-whenFalse`}
          label="No"
          value={metric.whenFalse}
          onChange={(v) => onChange({ ...metric, whenFalse: v })}
        />
      </>
    );
  }

  if (metric.curve === "matchOne") {
    return (
      <>
        <label className="inline-flex items-center gap-1 text-[11px] text-ink/55">
          <span className="text-ink/45">
            {metric.source === "deliveryId" ? "Delivery" : "Effect"}
          </span>
          <select
            value={metric.matchKey}
            onChange={(e) => onChange({ ...metric, matchKey: e.target.value })}
            className="min-h-6 max-w-[7rem] rounded border border-line bg-white px-1.5 py-0.5 text-xs"
          >
            {matchKeyOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
            {!matchKeyOptions.some((o) => o.id === metric.matchKey) ? (
              <option value={metric.matchKey}>{metric.matchKey}</option>
            ) : null}
          </select>
        </label>
        <CompactNum
          id={`radar-${metric.id}-whenMatch`}
          label="Hit"
          value={metric.whenMatch}
          onChange={(v) => onChange({ ...metric, whenMatch: v })}
        />
        <CompactNum
          id={`radar-${metric.id}-whenNoMatch`}
          label="Miss"
          value={metric.whenNoMatch}
          onChange={(v) => onChange({ ...metric, whenNoMatch: v })}
        />
      </>
    );
  }

  return null;
}

function MetricRow({
  metric,
  modifierOptions,
  effectKindOptions,
  deliveryOptions,
  expanded,
  onToggleExpand,
  onChange,
  onRemove,
}: {
  metric: RadarMetric;
  modifierOptions: Option[];
  effectKindOptions: Option[];
  deliveryOptions: Option[];
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (metric: RadarMetric) => void;
  onRemove: () => void;
}) {
  const sourceLabel =
    RADAR_SOURCE_OPTIONS.find((s) => s.id === metric.source)?.label ??
    metric.source;
  const needsExpand =
    metric.curve === "enumMap" ||
    metric.curve === "higherBetter" ||
    metric.curve === "lowerBetter";

  const matchKeyOptions =
    metric.source === "effectKind"
      ? effectKindOptions
      : metric.source === "deliveryId"
        ? deliveryOptions
        : [];

  return (
    <div
      className={`${metric.enabled ? "" : "opacity-50"} ${
        expanded ? "bg-paper/40" : "hover:bg-paper/25"
      }`}
      title={metric.id}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
        <CardEnableToggle
          id={`radar-metric-${metric.id}-enabled`}
          checked={metric.enabled}
          onChange={(enabled) => onChange({ ...metric, enabled })}
        />

        <input
          id={`radar-metric-${metric.id}-label`}
          value={metric.label}
          onChange={(e) => onChange({ ...metric, label: e.target.value })}
          className="min-w-[5rem] max-w-[10rem] flex-1 border-0 border-b border-transparent bg-transparent py-0.5 text-xs font-semibold text-ink hover:border-line focus:border-accent focus:outline-none"
        />

        <span className="hidden text-[10px] text-ink/40 sm:inline">{sourceLabel}</span>

        <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-ink/55">
          {CURVE_LABELS[metric.curve]}
        </span>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <MetricRowControls
            metric={metric}
            modifierOptions={modifierOptions}
            effectKindOptions={effectKindOptions}
            deliveryOptions={deliveryOptions}
            onChange={onChange}
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {needsExpand ? (
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              className="text-[10px] font-medium text-ink/45 hover:text-ink"
            >
              {expanded ? "Less" : "More"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="text-[10px] font-medium text-ink/40 hover:text-warn"
          >
            Remove
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-line/60 px-3 pb-2.5 pt-2 pl-10">
          <p className="mb-2 text-[10px] text-ink/40 sm:hidden">{sourceLabel}</p>
          {metric.curve === "higherBetter" || metric.curve === "lowerBetter" ? (
            <p className="text-[11px] text-ink/50">
              Midpoint — value that scores 0.5 on the soft curve (
              {metric.curve === "lowerBetter" ? "lower is better" : "higher is better"}
              ).
            </p>
          ) : null}
          {metric.curve === "enumMap" ? (
            <EnumMapEditor
              metric={metric}
              keyOptions={matchKeyOptions}
              onChange={onChange}
            />
          ) : null}
          <p className="mt-2 font-mono text-[10px] text-ink/30">{metric.id}</p>
        </div>
      ) : null}
    </div>
  );
}

function AxisAddForm({
  axisId,
  effectKindOptions,
  deliveryOptions,
  modifierOptions,
  onAdd,
}: {
  axisId: RadarAxisId;
  effectKindOptions: Option[];
  deliveryOptions: Option[];
  modifierOptions: Option[];
  onAdd: (metric: RadarMetric) => void;
}) {
  const [open, setOpen] = useState(false);
  const [source, setSource] = useState<RadarSourceId>("manaCost");
  const [effectKind, setEffectKind] = useState(effectKindOptions[0]?.id ?? "slow");
  const [deliveryId, setDeliveryId] = useState(deliveryOptions[0]?.id ?? "hurl");

  function handleAdd() {
    onAdd(
      defaultMetricForSource(axisId, source, {
        modifierId: modifierOptions[0]?.id ?? "split",
        effectKind,
        deliveryId,
      })
    );
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-medium text-ink/50 hover:text-ink"
      >
        + Add metric
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-0.5">
        <span className="text-[10px] font-medium text-ink/50">Source</span>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as RadarSourceId)}
          className="min-h-6 rounded border border-line bg-white px-1.5 py-0.5 text-xs"
        >
          {RADAR_SOURCE_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>
      {source === "effectKind" ? (
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-ink/50">Effect</span>
          <select
            value={effectKind}
            onChange={(e) => setEffectKind(e.target.value)}
            className="min-h-6 rounded border border-line bg-white px-1.5 py-0.5 text-xs"
          >
            {effectKindOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {source === "deliveryId" ? (
        <label className="flex flex-col gap-0.5">
          <span className="text-[10px] font-medium text-ink/50">Delivery</span>
          <select
            value={deliveryId}
            onChange={(e) => setDeliveryId(e.target.value)}
            className="min-h-6 rounded border border-line bg-white px-1.5 py-0.5 text-xs"
          >
            {deliveryOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <button
        type="button"
        onClick={handleAdd}
        className="rounded bg-ink px-2.5 py-1 text-[11px] font-medium text-paper hover:bg-ink/90"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-[11px] text-ink/45 hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}

function AxisPanel({
  axisId,
  label,
  metrics,
  modifierOptions,
  effectKindOptions,
  deliveryOptions,
  expandedIds,
  onToggleExpand,
  onChange,
  onRemove,
  onAdd,
}: {
  axisId: RadarAxisId;
  label: string;
  metrics: RadarMetric[];
  modifierOptions: Option[];
  effectKindOptions: Option[];
  deliveryOptions: Option[];
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onChange: (metric: RadarMetric) => void;
  onRemove: (id: string) => void;
  onAdd: (metric: RadarMetric) => void;
}) {
  return (
    <section className="overflow-hidden rounded border border-line bg-white">
      <header className="flex items-center justify-between border-b border-line bg-paper/60 px-3 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/70">
          {label}
        </h2>
        <span className="text-[10px] text-ink/45">
          {metrics.length} metric{metrics.length === 1 ? "" : "s"}
        </span>
      </header>

      {metrics.length === 0 ? (
        <p className="px-3 py-3 text-xs text-ink/45">No metrics on this axis.</p>
      ) : (
        <div className="divide-y divide-line/70">
          {metrics.map((metric) => (
            <MetricRow
              key={metric.id}
              metric={metric}
              modifierOptions={modifierOptions}
              effectKindOptions={effectKindOptions}
              deliveryOptions={deliveryOptions}
              expanded={expandedIds.has(metric.id)}
              onToggleExpand={() => onToggleExpand(metric.id)}
              onChange={onChange}
              onRemove={() => onRemove(metric.id)}
            />
          ))}
        </div>
      )}

      <footer className="border-t border-line bg-paper/30 px-3 py-2">
        <AxisAddForm
          axisId={axisId}
          effectKindOptions={effectKindOptions}
          deliveryOptions={deliveryOptions}
          modifierOptions={modifierOptions}
          onAdd={onAdd}
        />
      </footer>
    </section>
  );
}

export default function RadarParamsPanel({
  radarMetrics,
  onChange,
  onAdd,
  onRemove,
  onRestoreDefaults,
  nouns,
  deliveryVerbs,
  modifierVerbs,
}: {
  radarMetrics: RadarMetric[];
  onChange: (metric: RadarMetric) => void;
  onAdd: (metric: RadarMetric) => void;
  onRemove: (id: string) => void;
  onRestoreDefaults: () => void;
  nouns: Noun[];
  deliveryVerbs: { id: string; name: string }[];
  modifierVerbs: { id: string; name: string }[];
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const effectKindOptions = collectEffectKindOptions(nouns);
  const deliveryOptions = deliveryVerbs.map((d) => ({
    id: d.id,
    label: d.name,
  }));
  const modifierOptions = modifierVerbs.map((m) => ({
    id: m.id,
    label: m.name,
  }));

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-2xl text-xs text-ink/50 text-pretty">
          Each axis groups its scoring metrics. Edit values inline; use{" "}
          <span className="font-medium text-ink/65">More</span> for midpoint
          details. Hover a row to see its internal id.
        </p>
        <button
          type="button"
          onClick={onRestoreDefaults}
          className="shrink-0 rounded border border-line px-3 py-1.5 text-xs font-medium text-ink/60 hover:border-ink/30 hover:text-ink"
        >
          Restore defaults
        </button>
      </div>

      {RADAR_AXIS_OPTIONS.map((axis) => (
        <AxisPanel
          key={axis.id}
          axisId={axis.id}
          label={axis.label}
          metrics={radarMetrics.filter((m) => m.axisId === axis.id)}
          modifierOptions={modifierOptions}
          effectKindOptions={effectKindOptions}
          deliveryOptions={deliveryOptions}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          onChange={onChange}
          onRemove={onRemove}
          onAdd={onAdd}
        />
      ))}
    </div>
  );
}

export { defaultRadarMetrics };

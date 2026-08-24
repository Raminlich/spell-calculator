"use client";

import type { ReactNode } from "react";

export function parseNum(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

export function CompactNum({
  id,
  label,
  value,
  onChange,
  step = 0.1,
  min,
  max,
  width = "4.25rem",
  className,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  width?: string;
  className?: string;
}) {
  return (
    <label
      className={`inline-flex items-center gap-1 text-[11px] text-ink/55 ${className ?? ""}`}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="shrink-0 text-ink/45">
        {label}
      </span>
      <input
        id={id}
        type="number"
        step={step}
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseNum(e.target.value))}
        style={{ width }}
        className="min-h-6 rounded border border-line bg-white px-1.5 py-0.5 text-xs font-mono tabular-nums focus:border-accent focus:outline-none"
      />
    </label>
  );
}

export function ComponentPanel({
  title,
  description,
  count,
  countLabel = "item",
  children,
}: {
  title: string;
  description?: string;
  count: number;
  countLabel?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded border border-line bg-white">
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-0.5 border-b border-line bg-paper/60 px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink/70">
            {title}
          </h2>
          {description ? (
            <p className="mt-0.5 max-w-2xl text-[10px] text-ink/45 text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-[10px] text-ink/45">
          {count} {countLabel}
          {count === 1 ? "" : "s"}
        </span>
      </header>
      <div className="divide-y divide-line/70">{children}</div>
    </section>
  );
}

export function ComponentRow({
  enabled,
  expanded,
  onToggleExpand,
  id,
  children,
  expandContent,
  showExpand = true,
}: {
  enabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  id: string;
  children: ReactNode;
  expandContent?: ReactNode;
  showExpand?: boolean;
}) {
  return (
    <div
      className={`${enabled ? "" : "opacity-50"} ${
        expanded ? "bg-paper/40" : "hover:bg-paper/25"
      }`}
      title={id}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2">
        {children}
        {showExpand ? (
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={onToggleExpand}
              aria-expanded={expanded}
              className="text-[10px] font-medium text-ink/45 hover:text-ink"
            >
              {expanded ? "Less" : "More"}
            </button>
          </div>
        ) : null}
      </div>
      {expanded && expandContent ? (
        <div className="border-t border-line/60 px-3 pb-2.5 pt-2 pl-10">
          {expandContent}
        </div>
      ) : null}
    </div>
  );
}

export function KindBadge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded bg-ink/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-ink/55">
      {children}
    </span>
  );
}

export function RowNameInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[5rem] max-w-[10rem] flex-1 border-0 border-b border-transparent bg-transparent py-0.5 text-xs font-semibold text-ink hover:border-line focus:border-accent focus:outline-none"
    />
  );
}
